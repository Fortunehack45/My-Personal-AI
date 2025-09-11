import { config } from 'dotenv';
config();

import '@/ai/flows/generate-response-based-on-context.ts';
import '@/ai/flows/summarize-uploaded-documents.ts';
import '@/ai/flows/contextual-conversation-memory.ts';