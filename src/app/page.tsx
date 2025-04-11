'use client';

import {useState} from 'react';

import {generateWorkoutPlan, GenerateWorkoutPlanOutput} from '@/ai/flows/generate-workout-plan';
import {suggestWorkout, SuggestWorkoutOutput} from '@/ai/flows/suggest-workout';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Skeleton} from '@/components/ui/skeleton';
import {Slider} from '@/components/ui/slider';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

const formSchema = z.object({
  exercise: z.string().min(2, {
    message: 'Exercise must be at least 2 characters.',
  }),
  pastWorkoutData: z.string(),
  fitnessGoals: z.string(),
});

const workoutPlanSchema = z.object({
  workoutPrompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

export default function Home() {
  const {toast} = useToast();
  const [aiResult, setAiResult] = useState<SuggestWorkoutOutput | null>(null);
  const [aiWorkoutPlan, setAiWorkoutPlan] =
    useState<GenerateWorkoutPlanOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [workoutPlanLoading, setWorkoutPlanLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      exercise: '',
      pastWorkoutData: '',
      fitnessGoals: '',
    },
  });

  const workoutPlanForm = useForm<z.infer<typeof workoutPlanSchema>>({
    defaultValues: {
      workoutPrompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setAiResult(null);
    try {
      const result = await suggestWorkout(values);
      setAiResult(result);
    } catch (e: any) {
      toast({
        title: 'Something went wrong.',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function onGenerateWorkoutPlan(
    values: z.infer<typeof workoutPlanSchema>
  ) {
    setWorkoutPlanLoading(true);
    setAiWorkoutPlan(null);
    try {
      const result = await generateWorkoutPlan(values);
      setAiWorkoutPlan(result);
    } catch (e: any) {
      toast({
        title: 'Something went wrong.',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setWorkoutPlanLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">LiftAssist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workout Suggestion</CardTitle>
            <CardDescription>
              Get AI-powered suggestions for your next workout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="exercise"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Exercise</FormLabel>
                      <FormControl>
                        <Input placeholder="Bench Press" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the exercise you want suggestions for.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastWorkoutData"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Past Workout Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sets: 3, Reps: 8, Weight: 150lbs"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your past workout data for this exercise.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessGoals"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Fitness Goals</FormLabel>
                      <FormControl>
                        <Input placeholder="Increase strength" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your fitness goals for this exercise.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Suggest Workout
                    </>
                  ) : (
                    'Suggest Workout'
                  )}
                </Button>
              </form>
            </Form>
            {aiResult ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Suggestion:</h3>
                <p>
                  Sets: {aiResult.suggestedSets}, Reps: {aiResult.suggestedReps},
                  Weight: {aiResult.suggestedWeight} lbs
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Reasoning:</span>{' '}
                  {aiResult.reasoning}
                </p>
              </div>
            ) : loading ? (
              <Skeleton className="w-full h-20 mt-6" />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Workout Plan</CardTitle>
            <CardDescription>
              Generate a full workout plan based on your prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...workoutPlanForm}>
              <form
                onSubmit={workoutPlanForm.handleSubmit(onGenerateWorkoutPlan)}
                className="space-y-4"
              >
                <FormField
                  control={workoutPlanForm.control}
                  name="workoutPrompt"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Workout Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full body workout for strength"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a prompt describing the workout you want to do.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={workoutPlanLoading}>
                  {workoutPlanLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generate Workout Plan
                    </>
                  ) : (
                    'Generate Workout Plan'
                  )}
                </Button>
              </form>
            </Form>
            {aiWorkoutPlan ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Workout Plan:</h3>
                <p>{aiWorkoutPlan.workoutPlan}</p>
              </div>
            ) : workoutPlanLoading ? (
              <Skeleton className="w-full h-20 mt-6" />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
