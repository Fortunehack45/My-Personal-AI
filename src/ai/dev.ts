import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/generate-response-based-on-context.ts';
import '@/ai/flows/summarize-uploaded-documents.ts';
import '@/ai/flows/contextual-conversation-memory.ts';
import '@/ai/flows/submit-feedback.ts';
import '@/ai/flows/admin-get-feedback.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-text.ts';
