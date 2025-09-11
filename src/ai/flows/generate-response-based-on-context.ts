'use server';
/**
 * @fileOverview This file defines a Genkit flow that generates a response based on the context provided, incorporating relevant information using vector embeddings.
 *
 * - generateResponseBasedOnContext - A function that generates a response based on the context.
 * - GenerateResponseBasedOnContextInput - The input type for the generateResponseBasedOnContext function.
 * - GenerateResponseBasedOnContextOutput - The return type for the generateResponseBasedOnContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseBasedOnContextInputSchema = z.object({
  conversationId: z.string().describe('The ID of the conversation.'),
  message: z.string().describe('The user message to respond to.'),
  retrievedContext: z.string().optional().describe('The context retrieved from vector embeddings.'),
});
export type GenerateResponseBasedOnContextInput = z.infer<typeof GenerateResponseBasedOnContextInputSchema>;

const GenerateResponseBasedOnContextOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type GenerateResponseBasedOnContextOutput = z.infer<typeof GenerateResponseBasedOnContextOutputSchema>;

export async function generateResponseBasedOnContext(input: GenerateResponseBasedOnContextInput): Promise<GenerateResponseBasedOnContextOutput> {
  return generateResponseBasedOnContextFlow(input);
}

const generateResponseBasedOnContextPrompt = ai.definePrompt({
  name: 'generateResponseBasedOnContextPrompt',
  input: {schema: GenerateResponseBasedOnContextInputSchema},
  output: {schema: GenerateResponseBasedOnContextOutputSchema},
  prompt: `You are a helpful AI assistant. Use the context provided to answer the user's message.

Context:
{{#if retrievedContext}}
{{{retrievedContext}}}
{{else}}
No context available.
{{/if}}

Message: {{{message}}}`,
});

const generateResponseBasedOnContextFlow = ai.defineFlow(
  {
    name: 'generateResponseBasedOnContextFlow',
    inputSchema: GenerateResponseBasedOnContextInputSchema,
    outputSchema: GenerateResponseBasedOnContextOutputSchema,
  },
  async input => {
    const {output} = await generateResponseBasedOnContextPrompt(input);
    return output!;
  }
);
