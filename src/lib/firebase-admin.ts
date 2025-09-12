'use server';
/**
 * @fileOverview Firebase Admin SDK operations for Firestore.
 *
 * - getFeedback - A function that fetches all feedback.
 * - submitFeedback - A function that submits feedback.
 * - Feedback - The type for a feedback item.
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import serviceAccount from '../../serviceAccountKey.json';

// This is the shape of the data we expect from Firestore.
export interface Feedback {
    id: string;
    userId: string;
    conversationId: string;
    messageId: string;
    messageContent: string;
    rating: 'like' | 'dislike';
    reason?: string;
    submittedAt: Date;
};

// This is the shape of the data returned by the main function.
export interface GetFeedbackOutput {
  feedback: Feedback[];
};

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);


export async function getFeedback(): Promise<GetFeedbackOutput> {
    const feedbackSnapshot = await db.collection('feedback').orderBy('submittedAt', 'desc').get();
    
    const feedback: Feedback[] = [];
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
        // Firestore Timestamps need to be converted to JS Dates
        submittedAt: (data.submittedAt as Timestamp).toDate(),
      });
    });

    return { feedback };
}


interface AdminSubmitFeedbackInput {
    messageId: string;
    rating: 'like' | 'dislike';
    reason?: string;
    conversationId: string;
    userId: string;
    messageContent: string;
};

export async function submitFeedback(input: AdminSubmitFeedbackInput): Promise<{success: boolean}> {
    await db.collection('feedback').add({
        ...input,
        submittedAt: Timestamp.now(),
      });
  return { success: true };
}
