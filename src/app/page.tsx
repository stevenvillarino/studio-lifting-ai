'use client';

import {useState} from 'react';

import {generateWorkoutPlan, GenerateWorkoutPlanOutput} from '@/ai/flows/generate-workout-plan';
import {getHistoricalWorkouts, GetHistoricalWorkoutsOutput} from '@/ai/flows/get-historical-workouts';
import {suggestWorkout, SuggestWorkoutOutput} from '@/ai/flows/suggest-workout';
import {suggestExerciseReplacement, SuggestExerciseReplacementOutput} from '@/ai/flows/suggest-exercise-replacement';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Skeleton} from '@/components/ui/skeleton';
import {Slider} from '@/components/ui/slider';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {CheckCircle, Circle, Dumbbell, Loader2} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

// Define schemas for forms and data structures
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

const exerciseReplacementSchema = z.object({
  currentExercise: z.string().min(2, {
    message: 'Exercise name must be at least 2 characters.',
  }),
  fitnessGoals: z.string(),
  equipmentAvailable: z.string(),
  muscleGroup: z.string(),
});

// Define training plans
const trainingPlans = [
  {
    id: 'hypertrophy-upper',
    name: 'Upper Body Hypertrophy',
    description: 'A 4-week plan focused on building muscle in the upper body.',
    duration: '4 Weeks',
    focus: 'Upper Body',
    exercises: [
      {name: 'Bench Press', sets: 3, reps: '8-12', weight: '70% of 1RM'},
      {name: 'Overhead Press', sets: 3, reps: '8-12', weight: '65% of 1RM'},
      {name: 'Pull-ups', sets: 3, reps: 'As many as possible', weight: 'Bodyweight'},
    ],
  },
  {
    id: 'hypertrophy-lower',
    name: 'Lower Body Hypertrophy',
    description: 'A 4-week plan focused on building muscle in the lower body.',
    duration: '4 Weeks',
    focus: 'Lower Body',
    exercises: [
      {name: 'Squats', sets: 3, reps: '8-12', weight: '70% of 1RM'},
      {name: 'Deadlifts', sets: 1, reps: '5', weight: '85% of 1RM'},
      {name: 'Leg Press', sets: 3, reps: '12-15', weight: '60% of 1RM'},
    ],
  },
  {
    id: 'full-body-strength',
    name: 'Full Body Strength',
    description: 'A 4-week plan focused on increasing overall strength.',
    duration: '4 Weeks',
    focus: 'Full Body',
    exercises: [
      {name: 'Barbell Rows', sets: 3, reps: '5-8', weight: '75% of 1RM'},
      {name: 'Push Press', sets: 3, reps: '5-8', weight: '75% of 1RM'},
      {name: 'Goblet Squats', sets: 3, reps: '8-12', weight: 'Moderate'},
    ],
  },
];

// Main component
export default function Home() {
  const {toast} = useToast();
  const [aiResult, setAiResult] = useState<SuggestWorkoutOutput | null>(null);
  const [aiWorkoutPlan, setAiWorkoutPlan] =
    useState<GenerateWorkoutPlanOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [workoutPlanLoading, setWorkoutPlanLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Track selected training plan
  const [exerciseProgress, setExerciseProgress] = useState<{
    [exerciseName: string]: boolean;
  }>({}); // Track individual exercise progress
  const [aiReplacement, setAiReplacement] = useState<SuggestExerciseReplacementOutput | null>(null);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [historicalWorkouts, setHistoricalWorkouts] = useState<GetHistoricalWorkoutsOutput | null>(null);
  const [historicalDataLoading, setHistoricalDataLoading] = useState(false);

  // Form hooks
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

  const exerciseReplacementForm = useForm<z.infer<typeof exerciseReplacementSchema>>({
    defaultValues: {
      currentExercise: '',
      fitnessGoals: '',
      equipmentAvailable: '',
      muscleGroup: '',
    },
  });

  // Form submission handlers
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

  async function onSuggestExerciseReplacement(values: z.infer<typeof exerciseReplacementSchema>) {
    setReplacementLoading(true);
    setAiReplacement(null);
    try {
      const result = await suggestExerciseReplacement(values);
      setAiReplacement(result);
      toast({
        title: 'Exercise Replacement Suggestion',
        description: 'Replacement exercise suggested successfully.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: 'Failed to suggest exercise replacement.',
        variant: 'destructive',
      });
    } finally {
      setReplacementLoading(false);
    }
  }

  // Handler to select a training plan
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Reset progress when a new plan is selected
    setExerciseProgress({});
  };

  // Handler to toggle exercise progress
  const handleToggleProgress = (exerciseName: string) => {
    setExerciseProgress(prevProgress => ({
      ...prevProgress,
      [exerciseName]: !prevProgress[exercise.name],
    }));
  };

  const handleGetHistoricalData = async (exerciseName: string) => {
    setHistoricalDataLoading(true);
    try {
      const result = await getHistoricalWorkouts({ exercise: exerciseName });
      setHistoricalWorkouts(result);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to retrieve historical workout data.',
        variant: 'destructive',
      });
    } finally {
      setHistoricalDataLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">LiftAssist</h1>

      {/* Training Plans Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Training Plans</h2>
        <Accordion type="single" collapsible>
          {trainingPlans.map(plan => (
            <AccordionItem key={plan.id} value={plan.id}>
              <AccordionTrigger onClick={() => handleSelectPlan(plan.id)}>
                {plan.name} - {plan.duration}
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">{plan.description}</p>
                <h3 className="font-semibold">Exercises:</h3>
                <ul>
                  {plan.exercises.map((exercise, index) => (
                    <li key={index} className="flex items-center justify-between py-2">
                      <div>
                        <button
                          onClick={() => handleToggleProgress(exercise.name)}
                          className="mr-2 focus:outline-none"
                        >
                          {exerciseProgress[exercise.name] ? (
                            <CheckCircle className="h-5 w-5 text-green-500"/>
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400"/>
                          )}
                        </button>
                        {exercise.name} - {exercise.sets} sets, {exercise.reps} reps @ {exercise.weight}
                      </div>
                      <Button onClick={() => handleGetHistoricalData(exercise.name)}
                              disabled={historicalDataLoading}>
                        {historicalDataLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Loading...
                          </>
                        ) : (
                          'View History'
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* AI Workout Suggestion Section */}
      <section className="mb-8">
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
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Suggest Workout
                    </>
                  ) : (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4"/>
                      Suggest Workout
                    </>
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
              <Skeleton className="w-full h-20 mt-6"/>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* AI Workout Plan Generation Section */}
      <section className="mb-8">
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
                <Button type="submit" disabled={workoutPlanLoading} className="bg-primary text-primary-foreground">
                  {workoutPlanLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Generate Workout Plan
                    </>
                  ) : (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4"/>
                      Generate Workout Plan
                    </>
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
              <Skeleton className="w-full h-20 mt-6"/>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Exercise Replacement Suggestion Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Suggest Exercise Replacement</CardTitle>
            <CardDescription>
              Suggest an alternative exercise based on your criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...exerciseReplacementForm}>
              <form onSubmit={exerciseReplacementForm.handleSubmit(onSuggestExerciseReplacement)}
                    className="space-y-4">
                <FormField
                  control={exerciseReplacementForm.control}
                  name="currentExercise"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Current Exercise</FormLabel>
                      <FormControl>
                        <Input placeholder="Squats" {...field} />
                      </FormControl>
                      <FormDescription>Enter the exercise you want to replace.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={exerciseReplacementForm.control}
                  name="fitnessGoals"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Fitness Goals</FormLabel>
                      <FormControl>
                        <Input placeholder="Increase strength" {...field} />
                      </FormControl>
                      <FormDescription>Enter your fitness goals.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={exerciseReplacementForm.control}
                  name="equipmentAvailable"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Equipment Available</FormLabel>
                      <FormControl>
                        <Input placeholder="Dumbbells, Resistance Bands" {...field} />
                      </FormControl>
                      <FormDescription>List the equipment you have available.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={exerciseReplacementForm.control}
                  name="muscleGroup"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Muscle Group</FormLabel>
                      <FormControl>
                        <Input placeholder="Legs" {...field} />
                      </FormControl>
                      <FormDescription>Enter the muscle group you want to target.</FormDescription>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={replacementLoading} className="bg-primary text-primary-foreground">
                  {replacementLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Suggest Replacement
                    </>
                  ) : (
                    'Suggest Replacement'
                  )}
                </Button>
              </form>
            </Form>
            {aiReplacement ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Replacement Suggestion:</h3>
                <p>{aiReplacement.suggestedExercise}</p>
                <p className="mt-2">
                  <span className="font-semibold">Reasoning:</span> {aiReplacement.reasoning}
                </p>
              </div>
            ) : replacementLoading ? (
              <Skeleton className="w-full h-20 mt-6"/>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {/* Historical Data Section */}
      <section className="mt-8">
        {historicalWorkouts ? (
          <Card>
            <CardHeader>
              <CardTitle>Historical Workout Data</CardTitle>
              <CardDescription>
                A history of your workouts for this exercise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Weight (lbs)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalWorkouts.map((workout, index) => (
                    <TableRow key={index}>
                      <TableCell>{workout.date}</TableCell>
                      <TableCell>{workout.sets}</TableCell>
                      <TableCell>{workout.reps}</TableCell>
                      <TableCell>{workout.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  Historical workout data.
                </TableCaption>
              </Table>
            </CardContent>
          </Card>
        ) : historicalDataLoading ? (
          <Skeleton className="w-full h-40 mt-6"/>
        ) : null}
      </section>
    </div>
  );
}
