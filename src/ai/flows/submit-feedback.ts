'use server';

/**
 * @fileOverview A flow for submitting user feedback on AI responses.
 *
 * - submitFeedback - A function that handles the feedback submission.
 * - SubmitFeedbackInput - The input type for the submitFeedback function.
 * - SubmitFeedbackOutput - The return type for the submitFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubmitFeedbackInputSchema = z.object({
  messageId: z.string().describe('The ID of the message being rated.'),
  rating: z.enum(['like', 'dislike']).describe('The feedback rating.'),
  reason: z.string().optional().describe('The reason for the feedback.'),
  conversationId: z.string().describe('The ID of the conversation.'),
  userId: z.string().describe('The ID of the user submitting the feedback.'),
  messageContent: z.string().describe('The content of the message being rated.'),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;

const SubmitFeedbackOutputSchema = z.object({
  success: z.boolean().describe('Whether the feedback was submitted successfully.'),
});
export type SubmitFeedbackOutput = z.infer<typeof SubmitFeedbackOutputSchema>;


const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: SubmitFeedbackInputSchema,
    outputSchema: SubmitFeedbackOutputSchema,
  },
  async (input) => {
    // In a real implementation, this would store the feedback in a database.
    // For this example, we'll just log it to the console.
    console.log(`Feedback submitted:`, input);
    
    // This is where you would add the logic to save to Firestore.
    // For example:
    // import { getFirestore } from 'firebase-admin/firestore';
    // const db = getFirestore();
    // await db.collection('feedback').add({
    //   ...input,
    //   submittedAt: new Date(),
    // });
    
    return { success: true };
  }
);


// This is a re-export of the admin-get-feedback submitFeedback function.
// We are doing this because the admin-get-feedback file is no longer a genkit flow,
// but we need to call the submitFeedback function from the message-list component.
// This is a temporary solution to avoid circular dependencies.
export { submitFeedback } from '@/ai/flows/admin-get-feedback';
