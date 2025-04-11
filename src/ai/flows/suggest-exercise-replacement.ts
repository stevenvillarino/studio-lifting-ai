'use server';
/**
 * @fileOverview AI-powered exercise replacement suggestion flow.
 *
 * - suggestExerciseReplacement - A function that suggests an exercise replacement.
 * - SuggestExerciseReplacementInput - The input type for the suggestExerciseReplacement function.
 * - SuggestExerciseReplacementOutput - The return type for the suggestExerciseReplacement function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestExerciseReplacementInputSchema = z.object({
  currentExercise: z.string().describe('The exercise the user wants to replace.'),
  fitnessGoals: z.string().describe('The user\'s fitness goals.'),
  equipmentAvailable: z.string().describe('The equipment available to the user.'),
  muscleGroup: z.string().describe('The muscle group the exercise targets.'),
});
export type SuggestExerciseReplacementInput = z.infer<typeof SuggestExerciseReplacementInputSchema>;

const SuggestExerciseReplacementOutputSchema = z.object({
  suggestedExercise: z.string().describe('The suggested replacement exercise.'),
  reasoning: z.string().describe('Explanation of why this exercise was recommended.'),
});
export type SuggestExerciseReplacementOutput = z.infer<typeof SuggestExerciseReplacementOutputSchema>;

export async function suggestExerciseReplacement(input: SuggestExerciseReplacementInput): Promise<SuggestExerciseReplacementOutput> {
  return suggestExerciseReplacementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExerciseReplacementPrompt',
  input: {
    schema: z.object({
      currentExercise: z.string().describe('The exercise the user wants to replace.'),
      fitnessGoals: z.string().describe('The user\'s fitness goals.'),
      equipmentAvailable: z.string().describe('The equipment available to the user.'),
      muscleGroup: z.string().describe('The muscle group the exercise targets.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedExercise: z.string().describe('The suggested replacement exercise.'),
      reasoning: z.string().describe('Explanation of why this exercise was recommended.'),
    }),
  },
  prompt: `Given the user's current exercise, fitness goals, available equipment, and the targeted muscle group, suggest a suitable replacement exercise. Explain your reasoning.

  Current Exercise: {{{currentExercise}}}
  Fitness Goals: {{{fitnessGoals}}}
  Equipment Available: {{{equipmentAvailable}}}
  Muscle Group: {{{muscleGroup}}}
  `,
});

const suggestExerciseReplacementFlow = ai.defineFlow<
  typeof SuggestExerciseReplacementInputSchema,
  typeof SuggestExerciseReplacementOutputSchema
>({
  name: 'suggestExerciseReplacementFlow',
  inputSchema: SuggestExerciseReplacementInputSchema,
  outputSchema: SuggestExerciseReplacementOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
