import {config} from 'dotenv';
config({path: '.env.local'});

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta', apiKey: 'AIzaSyDOe1T4DIbqnc7GvcYf-U3IvcPPLL1K5zs'})],
  model: 'googleai/gemini-2.5-flash',
});
