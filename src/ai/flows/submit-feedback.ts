'use server';

/**
 * @fileOverview This file handles feedback submission logic. It previously defined
 * a Genkit flow, but has been simplified to only export the necessary
 * feedback submission function to avoid conflicts with Genkit's AI plugin
 * initialization.
 *
 * - submitFeedback - A function that handles the feedback submission.
 */

// This is a re-export of the admin-get-feedback submitFeedback function.
// We are doing this because the admin-get-feedback file is no longer a genkit flow,
// but we need to call the submitFeedback function from the message-list component.
// This is a temporary solution to avoid circular dependencies.
export { submitFeedback } from '@/ai/flows/admin-get-feedback';
