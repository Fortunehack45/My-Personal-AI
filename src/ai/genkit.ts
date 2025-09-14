import {config} from 'dotenv';
config({path: '.env.local'});

import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/googleai';

export const googleAI = googleAIPlugin();

export const ai = genkit({
  plugins: [googleAI],
  model: 'googleai/gemini-2.5-flash',
});
