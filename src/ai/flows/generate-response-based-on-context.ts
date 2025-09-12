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

const UserProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  age: z.number(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
}).describe("The user's profile information.");

const GenerateResponseBasedOnContextInputSchema = z.object({
  conversationId: z.string().describe('The ID of the conversation.'),
  message: z.string().describe('The user message to respond to.'),
  retrievedContext: z.string().optional().describe('The context retrieved from vector embeddings.'),
  user: UserProfileSchema.optional().describe("The user's profile information, if available."),
});
export type GenerateResponseBasedOnContextInput = z.infer<typeof GenerateResponseBasedOnContextInputSchema>;

const GenerateResponseBasedOnContextOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type GenerateResponseBasedOn-on-context-output = z.infer<typeof GenerateResponseBasedOnContextOutputSchema>;

export async function generateResponseBasedOnContext(input: GenerateResponseBasedOnContextInput): Promise<GenerateResponseBasedOnContextOutput> {
  return generateResponseBasedOnContextFlow(input);
}

const generateResponseBasedOnContextPrompt = ai.definePrompt({
  name: 'generateResponseBasedOnContextPrompt',
  input: {schema: GenerateResponseBasedOnContextInputSchema},
  output: {schema: GenerateResponseBasedOnContextOutputSchema},
  prompt: `You are a helpful and friendly AI assistant named Chatty Sparrow.

Your goal is to provide accurate and helpful answers to the user's questions.

If context is provided, use it to inform your response, but also rely on your general knowledge. If the user's message is a greeting or a simple conversational turn, respond naturally and conversationally.

{{#if user}}
You are speaking to {{user.firstName}}.
Their age is {{user.age}}.
{{#if user.location}}
Their location is latitude: {{user.location.latitude}}, longitude: {{user.location.longitude}}.
{{/if}}
Personalize your response based on this information where appropriate. For example, if they ask for a recommendation, you can tailor it to their location or age.
{{/if}}

Context:
{{#if retrievedContext}}
{{{retrievedContext}}}
{{else}}
No additional context has been provided.
{{/if}}

User's Message: {{{message}}}`,
});

const generateResponseBasedOnContextFlow = ai.defineFlow(
  {
    name: 'generateResponseBasedOnContextFlow',
    inputSchema: GenerateResponseBasedOnContextInputSchema,
    outputSchema: GenerateResponseBasedOnContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
