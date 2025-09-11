'use server';

/**
 * @fileOverview Manages contextual memory for conversations by remembering the most recently interacted with conversations.
 *
 * - rememberRecentConversation - A function that stores the conversation id into context.
 * - RememberRecentConversationInput - The input type for the rememberRecentConversation function.
 * - RememberRecentConversationOutput - The return type for the rememberRecentConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RememberRecentConversationInputSchema = z.object({
  conversationId: z.string().describe('The ID of the conversation to remember.'),
});
export type RememberRecentConversationInput = z.infer<typeof RememberRecentConversationInputSchema>;

const RememberRecentConversationOutputSchema = z.object({
  success: z.boolean().describe('Whether remembering the conversation was successful.'),
});
export type RememberRecentConversationOutput = z.infer<typeof RememberRecentConversationOutputSchema>;

export async function rememberRecentConversation(input: RememberRecentConversationInput): Promise<RememberRecentConversationOutput> {
  return rememberRecentConversationFlow(input);
}

const rememberRecentConversationFlow = ai.defineFlow(
  {
    name: 'rememberRecentConversationFlow',
    inputSchema: RememberRecentConversationInputSchema,
    outputSchema: RememberRecentConversationOutputSchema,
  },
  async input => {
    // In a real implementation, this would likely involve updating a user's profile or session
    // with the `conversationId` in a database or similar persistent storage.
    // For this example, we'll just log the conversation ID.
    console.log(`Remembering conversation: ${input.conversationId}`);
    return { success: true };
  }
);
