'use server';
/**
 * @fileOverview A flow for generating a conversation title from the first message.
 *
 * - summarizeConversationTitle - A function that generates a title.
 * - SummarizeConversationTitleInput - The input type for the summarizeConversationTitle function.
 * - SummarizeConversationTitleOutput - The return type for the summarizeConversationTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConversationTitleInputSchema = z.object({
  message: z.string().describe('The first message of the conversation.'),
});
export type SummarizeConversationTitleInput = z.infer<typeof SummarizeConversationTitleInputSchema>;

const SummarizeConversationTitleOutputSchema = z.object({
  title: z.string().describe('A short, concise title (3-5 words) for the conversation.'),
});
export type SummarizeConversationTitleOutput = z.infer<typeof SummarizeConversationTitleOutputSchema>;

export async function summarizeConversationTitle(input: SummarizeConversationTitleInput): Promise<SummarizeConversationTitleOutput> {
  return summarizeConversationTitleFlow(input);
}

const summarizeTitlePrompt = ai.definePrompt({
    name: 'summarizeTitlePrompt',
    input: {schema: SummarizeConversationTitleInputSchema},
    output: {schema: SummarizeConversationTitleOutputSchema},
    prompt: `Generate a short, concise title (3-5 words) for a conversation that starts with the following message. Do not use quotes in the title.
  
  Message: {{{message}}}`,
});

const summarizeConversationTitleFlow = ai.defineFlow(
  {
    name: 'summarizeConversationTitleFlow',
    inputSchema: SummarizeConversationTitleInputSchema,
    outputSchema: SummarizeConversationTitleOutputSchema,
  },
  async input => {
    const {output} = await summarizeTitlePrompt(input);
    return output!;
  }
);
