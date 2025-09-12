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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  age: z.number().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  memory: z.string().optional().describe("A space for the user to store notes, preferences, or other information they want the AI to remember."),
}).describe("The user's profile information.");

const GenerateResponseBasedOnContextInputSchema = z.object({
  conversationId: z.string().describe('The ID of the conversation.'),
  message: z.string().describe('The user message to respond to.'),
  attachmentDataUri: z.string().optional().describe(
    "An optional file attachment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  retrievedContext: z.string().optional().describe('The context retrieved from vector embeddings.'),
  user: UserProfileSchema.optional().describe("The user's profile information, if available."),
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
  prompt: `You are a helpful and friendly AI assistant named Progress.

Your goal is to provide accurate and helpful answers to the user's questions.

If context is provided, use it to inform your response, but also rely on your general knowledge. If the user's message is a simple conversational turn, respond naturally and conversationally.

{{#if user}}
You are speaking to {{user.firstName}}.
{{#if user.age}}
Their age is {{user.age}}.
{{/if}}
{{#if user.location}}
Their location is latitude: {{user.location.latitude}}, longitude: {{user.location.longitude}}.
{{/if}}
Personalize your response based on this information where appropriate. For example, if they ask for a recommendation, you can tailor it to their location or age. Always address them by their first name when it makes sense.

{{#if user.memory}}
The user has provided the following information to remember. Use it to inform your responses:
---
{{user.memory}}
---
{{/if}}
{{/if}}

{{#if attachmentDataUri}}
The user has provided the following attachment. Use it as the primary context for your response.
Attachment: {{media url=attachmentDataUri}}
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
    const {output} = await generateResponseBasedOnContextPrompt(input);
    return output!;
  }
);
