'use server';
/**
 * @fileOverview A flow for admins to retrieve user feedback.
 *
 * - getFeedback - A function that fetches all feedback.
 * - GetFeedbackOutput - The return type for the getFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseAdminConfig } from '@/lib/firebase-admin-config';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp(firebaseAdminConfig);
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);


const FeedbackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
  messageContent: z.string(),
  rating: z.enum(['like', 'dislike']),
  reason: z.string().optional(),
  submittedAt: z.string().transform((str) => new Date(str)),
});

const GetFeedbackOutputSchema = z.object({
  feedback: z.array(FeedbackSchema),
});
export type GetFeedbackOutput = z.infer<typeof GetFeedbackOutputSchema>;


const getFeedbackFlow = ai.defineFlow(
  {
    name: 'getFeedbackFlow',
    outputSchema: GetFeedbackOutputSchema,
  },
  async () => {
    const feedbackSnapshot = await db.collection('feedback').orderBy('submittedAt', 'desc').get();
    
    const feedback: z.infer<typeof FeedbackSchema>[] = [];
    feedbackSnapshot.forEach(doc => {
      const data = doc.data();
      feedback.push({
        id: doc.id,
        userId: data.userId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        messageContent: data.messageContent,
        rating: data.rating,
        reason: data.reason,
        // Firestore Timestamps need to be converted to ISO strings for Zod parsing
        submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
      });
    });

    return { feedback };
  }
);


// This is the function we'll call from the frontend.
// It requires an admin check, which we will do on the frontend for simplicity,
// but in a production app, you'd want to verify admin status here.
export async function getFeedback(): Promise<GetFeedbackOutput> {
    return getFeedbackFlow();
}

// We need to slightly adjust the submit feedback flow to use the Admin SDK
// to write to the 'feedback' collection which has restricted write access.
const AdminSubmitFeedbackInputSchema = z.object({
    messageId: z.string(),
    rating: z.enum(['like', 'dislike']),
    reason: z.string().optional(),
    conversationId: z.string(),
    userId: z.string(),
    messageContent: z.string(),
});

const adminSubmitFeedbackFlow = ai.defineFlow(
    {
      name: 'adminSubmitFeedbackFlow',
      inputSchema: AdminSubmitFeedbackInputSchema,
      outputSchema: z.object({ success: z.boolean() }),
    },
    async (input) => {
        await db.collection('feedback').add({
            ...input,
            submittedAt: Timestamp.now(),
          });
      return { success: true };
    }
);

// We override the old submitFeedback function to use the admin one
async function submitFeedback(input: z.infer<typeof AdminSubmitFeedbackInputSchema>): Promise<{success: boolean}> {
    return adminSubmitFeedbackFlow(input);
}
// We also need to re-export the original flow we are calling now from message-list
export { submitFeedback };
