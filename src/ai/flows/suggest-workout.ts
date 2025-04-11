'use server';

/**
 * @fileOverview AI-powered workout suggestion flow.
 *
 * - suggestWorkout - A function that suggests workout sets, reps, and weight.
 * - SuggestWorkoutInput - The input type for the suggestWorkout function.
 * - SuggestWorkoutOutput - The return type for the suggestWorkout function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestWorkoutInputSchema = z.object({
  pastWorkoutData: z
    .string()
    .describe(
      'The user’s past workout data, including exercises, sets, reps, and weight lifted.'
    ),
  fitnessGoals: z
    .string()
    .describe(
      'The user\'s fitness goals, such as increasing strength, building muscle, \
       or improving endurance.'
    ),
  exercise: z.string().describe('The exercise for which to suggest a workout.'),
});
export type SuggestWorkoutInput = z.infer<typeof SuggestWorkoutInputSchema>;

const SuggestWorkoutOutputSchema = z.object({
  suggestedSets: z.number().describe('The suggested number of sets.'),
  suggestedReps: z.number().describe('The suggested number of reps.'),
  suggestedWeight: z.number().describe('The suggested weight to lift (in lbs).'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these values were recommended based on the input data.'
    ),
});
export type SuggestWorkoutOutput = z.infer<typeof SuggestWorkoutOutputSchema>;

export async function suggestWorkout(input: SuggestWorkoutInput): Promise<SuggestWorkoutOutput> {
  return suggestWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkoutPrompt',
  input: {
    schema: z.object({
      pastWorkoutData: z
        .string()
        .describe(
          'The user’s past workout data, including exercises, sets, reps, and weight lifted.'
        ),
      fitnessGoals: z
        .string()
        .describe(
          'The user\'s fitness goals, such as increasing strength, building muscle, or improving endurance.'
        ),
      exercise: z.string().describe('The exercise for which to suggest a workout.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedSets: z.number().describe('The suggested number of sets.'),
      suggestedReps: z.number().describe('The suggested number of reps.'),
      suggestedWeight: z.number().describe('The suggested weight to lift (in lbs).'),
      reasoning:
          z.string().describe('Explanation of why these values were recommended based on the input data.')
    }),
  },
  prompt: `Given the user's past workout data and fitness goals, suggest sets, reps,
  and weight for their next workout, for the given exercise. Explain your reasoning.

  Exercise: {{{exercise}}}
  Past Workout Data: {{{pastWorkoutData}}}
  Fitness Goals: {{{fitnessGoals}}}

  Give the response in JSON format.
  `,
});

const suggestWorkoutFlow = ai.defineFlow<
  typeof SuggestWorkoutInputSchema,
  typeof SuggestWorkoutOutputSchema
>({
  name: 'suggestWorkoutFlow',
  inputSchema: SuggestWorkoutInputSchema,
  outputSchema: SuggestWorkoutOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

