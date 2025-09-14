/**
 * @fileoverview Genkit /api route.
 *
 * This file is a Next.js App Router route handler. It is used to handle all
 * incoming requests to the /api/genkit/* path. It is responsible for
 * forwarding the request to the Genkit APM.
 */

import {createApi} from '@genkit-ai/next/app';
import {appRouter} from '@/ai/dev';

export const {GET, POST, OPTIONS} = createApi({router: appRouter});
