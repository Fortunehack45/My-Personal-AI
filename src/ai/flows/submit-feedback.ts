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
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;

const SubmitFeedbackOutputSchema = z.object({
  success: z.boolean().describe('Whether the feedback was submitted successfully.'),
});
export type SubmitFeedbackOutput = z.infer<typeof SubmitFeedbackOutputSchema>;

export async function submitFeedback(input: SubmitFeedbackInput): Promise<SubmitFeedbackOutput> {
  return submitFeedbackFlow(input);
}

const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: SubmitFeedbackInputSchema,
    outputSchema: SubmitFeedbackOutputSchema,
  },
  async input => {
    // In a real implementation, this would store the feedback in a database.
    // For this example, we'll just log it to the console.
    console.log(`Feedback submitted for message ${input.messageId}: ${input.rating}`);
    return { success: true };
  }
);
