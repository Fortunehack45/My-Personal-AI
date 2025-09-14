import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/googleai';
import {nextPlugin} from '@genkit-ai/next';

export const googleAI = googleAIPlugin();

export const ai = genkit({
  plugins: [googleAI, nextPlugin()],
  model: 'googleai/gemini-2.5-flash',
});
