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

function getServiceAccount() {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountStr) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. This is required for server-side Firebase operations.');
  }
  try {
    return JSON.parse(Buffer.from(serviceAccountStr, 'base64').toString('utf8'));
  } catch (e) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid base64-encoded JSON string.');
  }
}

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert(getServiceAccount() as ServiceAccount),
    });
  } catch (e: any) {
    console.error("Failed to initialize Firebase Admin SDK:", e.message);
    // We'll throw an error in functions that need it, but allow the app to load.
  }
} else {
  adminApp = getApps()[0];
}


function getDb() {
    if (!adminApp) {
        throw new Error("Firebase Admin SDK is not initialized. Check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
    }
    return getFirestore(adminApp);
}


export async function getFeedback(): Promise<GetFeedbackOutput> {
    const db = getDb();
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
    const db = getDb();
    await db.collection('feedback').add({
        ...input,
        submittedAt: Timestamp.now(),
      });
  return { success: true };
}


interface DeleteConversationInput {
    userId: string;
    conversationId: string;
};

export async function deleteConversation(input: DeleteConversationInput): Promise<{success: boolean}> {
    const db = getDb();
    const convoRef = db.collection('users').doc(input.userId).collection('conversations').doc(input.conversationId);
    
    // Recursively delete subcollections (messages)
    // This is important as deleting a document does not delete its subcollections
    const collections = await convoRef.listCollections();
    for (const collection of collections) {
        const documents = await collection.listDocuments();
        for (const doc of documents) {
            await doc.delete();
        }
    }
    
    // Delete the conversation document itself
    await convoRef.delete();
    
    return { success: true };
}

interface UpdateMessageContentInput {
    userId: string;
    conversationId: string;
    messageId: string;
    newContent: string;
};

export async function updateMessageContent(input: UpdateMessageContentInput): Promise<{success: boolean}> {
    const db = getDb();
    const messageRef = db.collection('users').doc(input.userId).collection('conversations').doc(input.conversationId).collection('messages').doc(input.messageId);
    await messageRef.update({ content: input.newContent });
    return { success: true };
}
