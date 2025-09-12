import {config} from 'dotenv';
config({path: '.env.local'});

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta'})],
  model: 'googleai/gemini-2.5-flash',
});
