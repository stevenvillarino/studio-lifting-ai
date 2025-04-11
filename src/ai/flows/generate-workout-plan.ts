// This file is machine-generated - edit with care!
'use server';
/**
 * @fileOverview A workout plan generator AI agent.
 *
 * - generateWorkoutPlan - A function that handles the workout plan generation process.
 * - GenerateWorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - GenerateWorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateWorkoutPlanInputSchema = z.object({
  workoutPrompt: z.string().describe('A high-level prompt describing the desired workout.'),
});
export type GenerateWorkoutPlanInput = z.infer<typeof GenerateWorkoutPlanInputSchema>;

const GenerateWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('A detailed workout plan including exercises, sets, and reps.'),
});
export type GenerateWorkoutPlanOutput = z.infer<typeof GenerateWorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(input: GenerateWorkoutPlanInput): Promise<GenerateWorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {
    schema: z.object({
      workoutPrompt: z.string().describe('A high-level prompt describing the desired workout.'),
    }),
  },
  output: {
    schema: z.object({
      workoutPlan: z.string().describe('A detailed workout plan including exercises, sets, and reps.'),
    }),
  },
  prompt: `You are a personal weightlifting coach. The user will give you a high-level prompt describing the workout they want to do, and you will respond with a detailed workout plan including exercises, sets, and reps. 

Workout Prompt: {{{workoutPrompt}}}`,
});

const generateWorkoutPlanFlow = ai.defineFlow<
  typeof GenerateWorkoutPlanInputSchema,
  typeof GenerateWorkoutPlanOutputSchema
>(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: GenerateWorkoutPlanInputSchema,
    outputSchema: GenerateWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
