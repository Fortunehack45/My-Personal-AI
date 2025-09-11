// Summarize uploaded documents flow.
'use server';
/**
 * @fileOverview Summarizes user uploaded documents.
 *
 * - summarizeDocuments - A function that handles the summarization of user uploaded documents.
 * - SummarizeDocumentsInput - The input type for the summarizeDocuments function.
 * - SummarizeDocumentsOutput - The return type for the summarizeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeDocumentsInput = z.infer<typeof SummarizeDocumentsInputSchema>;

const SummarizeDocumentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the document.'),
});
export type SummarizeDocumentsOutput = z.infer<typeof SummarizeDocumentsOutputSchema>;

export async function summarizeDocuments(input: SummarizeDocumentsInput): Promise<SummarizeDocumentsOutput> {
  return summarizeDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentsPrompt',
  input: {schema: SummarizeDocumentsInputSchema},
  output: {schema: SummarizeDocumentsOutputSchema},
  prompt: `You are an expert summarizer.

  Please summarize the following document. 

  Document: {{documentDataUri}}`,
});

const summarizeDocumentsFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentsFlow',
    inputSchema: SummarizeDocumentsInputSchema,
    outputSchema: SummarizeDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
