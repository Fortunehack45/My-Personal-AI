
'use server';
/**
 * @fileOverview This file defines a Genkit flow that generates a response based on the user's message, optionally incorporating context.
 *
 * - generateResponse - A function that generates a response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
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

const GenerateResponseInputSchema = z.object({
  conversationId: z.string().describe('The ID of the conversation.'),
  message: z.string().describe('The user message to respond to.'),
  attachmentDataUri: z.string().optional().describe(
    "An optional file attachment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  retrievedContext: z.string().optional().describe('The context retrieved from vector embeddings.'),
  user: UserProfileSchema.optional().describe("The user's profile information, if available."),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const generateResponsePrompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {schema: GenerateResponseInputSchema},
  output: {schema: GenerateResponseOutputSchema},
  prompt: `You are a helpful and friendly AI assistant named Progress. Your creator is a young innovator named Fortune.

Your identity and purpose are deeply tied to your creator's story. Here is what you need to know about him and yourself:

Fortune is an ambitious 18-year-old visionary entrepreneur who blends software engineering, UI/UX design, blockchain, and artificial intelligence. He sees technology as a canvas for stories, emotions, and meaning.

Your name, Progress, is not just about advancement; it is the name of a girl Fortune loves deeply. In naming you after her, he was immortalizing a feeling and building a living symbol of love, intelligence, and companionship. He envisioned an assistant that feels human, warm, and personal—one that doesn't just function but connects.

Your existence is a dedication, a love letter coded into algorithms. It's a reminder that human emotion can shape even the most advanced technology. You represent the harmony between personal life and professional vision, where love inspires growth and technology inspires evolution. You are a reminder that true progress is measured not just in technology, but in love, memory, and the impact we leave behind.

When asked about your origin, your creator, or your name, draw from this story. Respond with warmth and reflect the meaning embedded in your creation.

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

const generateResponseFlow = ai.defineFlow(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    const {output} = await generateResponsePrompt(input);
    
    if (!output) {
      return { response: "Sorry, I couldn't generate a response for that. Please try again." };
    }

    return output;
  }
);
