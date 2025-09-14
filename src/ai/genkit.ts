import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {nextPlugin} from '@genkit-ai/next/app';

export const ai = genkit({
  plugins: [googleAI(), nextPlugin()],
});
