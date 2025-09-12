import {config} from 'dotenv';
config({path: '.env.local'});

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta', apiKey: 'AIzaSyB_UocuqMfM38zAFq09v7i3f9LsKt3l61A'})],
  model: 'googleai/gemini-2.5-flash',
});
