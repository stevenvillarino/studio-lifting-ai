'use server';

/**
 * @fileOverview AI-powered historical workout data retrieval flow.
 *
 * - getHistoricalWorkouts - A function that retrieves historical workout data.
 * - GetHistoricalWorkoutsInput - The input type for the getHistoricalWorkouts function.
 * - GetHistoricalWorkoutsOutput - The return type for the getHistoricalWorkouts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GetHistoricalWorkoutsInputSchema = z.object({
  exercise: z.string().describe('The exercise to retrieve historical data for.'),
});
export type GetHistoricalWorkoutsInput = z.infer<typeof GetHistoricalWorkoutsInputSchema>;

const WorkoutEntrySchema = z.object({
  date: z.string().describe('The date of the workout.'),
  sets: z.number().describe('The number of sets performed.'),
  reps: z.number().describe('The number of repetitions performed.'),
  weight: z.number().describe('The weight lifted (in lbs).'),
});

const GetHistoricalWorkoutsOutputSchema = z.array(WorkoutEntrySchema).describe('A list of historical workout entries.');
export type GetHistoricalWorkoutsOutput = z.infer<typeof GetHistoricalWorkoutsOutputSchema>;

export async function getHistoricalWorkouts(input: GetHistoricalWorkoutsInput): Promise<GetHistoricalWorkoutsOutput> {
  return getHistoricalWorkoutsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getHistoricalWorkoutsPrompt',
  input: {
    schema: z.object({
      exercise: z.string().describe('The exercise to retrieve historical data for.'),
    }),
  },
  output: {
    schema: z.array(
      z.object({
        date: z.string().describe('The date of the workout.'),
        sets: z.number().describe('The number of sets performed.'),
        reps: z.number().describe('The number of repetitions performed.'),
        weight: z.number().describe('The weight lifted (in lbs).'),
      })
    ),
  },
  prompt: `Given the exercise, retrieve historical workout data.
  Exercise: {{{exercise}}}

  Return the data in JSON format.
  `,
});

const getHistoricalWorkoutsFlow = ai.defineFlow<
  typeof GetHistoricalWorkoutsInputSchema,
  typeof GetHistoricalWorkoutsOutputSchema
>({
  name: 'getHistoricalWorkoutsFlow',
  inputSchema: GetHistoricalWorkoutsInputSchema,
  outputSchema: GetHistoricalWorkoutsOutputSchema,
},
async input => {
  // Hardcoded data for now
  const historicalData = [
    { date: '2024-01-01', sets: 3, reps: 8, weight: 150 },
    { date: '2024-01-08', sets: 3, reps: 10, weight: 155 },
    { date: '2024-01-15', sets: 3, reps: 12, weight: 160 },
  ];

  // Filter data for the given exercise (currently all data is for one exercise)
  const filteredData = historicalData;

  return filteredData as GetHistoricalWorkoutsOutput;
});
