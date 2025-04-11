'use client';

import {useState, useEffect, useMemo, useRef} from 'react';

import {getHistoricalWorkouts, GetHistoricalWorkoutsOutput} from '@/ai/flows/get-historical-workouts';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Skeleton} from '@/components/ui/skeleton';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {CheckCircle, Circle, Dumbbell, Loader2, Settings} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

// Define schemas for forms and data structures
const workoutLogSchema = z.object({
  sets: z.string(),
  reps: z.string(),
  weight: z.string(),
  date: z.string()
});

// Define onboarding schema
const onboardingSchema = z.object({
  fitnessGoals: z.enum(['build-muscle', 'lose-weight', 'increase-strength', 'improve-endurance']),
  focus: z.enum(['upper', 'lower', 'full']),
});

// Define training plans
const trainingPlans = [
  {
    id: 'hypertrophy-upper',
    name: 'Upper Body Hypertrophy',
    description: 'A 4-week plan focused on building muscle in the upper body.',
    duration: '4 Weeks',
    focus: 'Upper Body',
    difficulty: 'medium',
    exercises: {
      "Monday": [{name: 'Bench Press', sets: 3, reps: '8-12', weight: '70% of 1RM'}],
      "Tuesday": [{name: 'Overhead Press', sets: 3, reps: '8-12', weight: '65% of 1RM'}],
      "Wednesday": [{name: 'Pull-ups', sets: 3, reps: 'As many as possible', weight: 'Bodyweight'}],
      "Thursday": [{name: 'Barbell Rows', sets: 3, reps: '5-8', weight: '75% of 1RM'}],
      "Friday": [{name: 'Push Press', sets: 3, reps: '5-8', weight: '75% of 1RM'}]
    }
  },
  {
    id: 'hypertrophy-lower',
    name: 'Lower Body Hypertrophy',
    description: 'A 4-week plan focused on building muscle in the lower body.',
    duration: '4 Weeks',
    focus: 'Lower Body',
    difficulty: 'medium',
    exercises: {
      "Monday": [{name: 'Squats', sets: 3, reps: '8-12', weight: '70% of 1RM'}],
      "Tuesday": [{name: 'Deadlifts', sets: 1, reps: '5', weight: '85% of 1RM'}],
      "Wednesday": [{name: 'Leg Press', sets: 3, reps: '12-15', weight: '60% of 1RM'}],
      "Thursday": [{name: 'Hamstring Curls', sets: 3, reps: '8-12', weight: '70% of 1RM'}],
      "Friday": [{name: 'Calf Raises', sets: 3, reps: '12-15', weight: 'Bodyweight'}]
    }
  },
  {
    id: 'full-body-strength',
    name: 'Full Body Strength',
    description: 'A 4-week plan focused on increasing overall strength.',
    duration: '4 Weeks',
    focus: 'Full Body',
    difficulty: 'hard',
    exercises: {
      "Monday": [{name: 'Barbell Rows', sets: 3, reps: '5-8', weight: '75% of 1RM'}],
      "Tuesday":  [{name: 'Push Press', sets: 3, reps: '5-8', weight: '75% of 1RM'}],
      "Wednesday": [{name: 'Goblet Squats', sets: 3, reps: '8-12', weight: 'Moderate'}],
      "Thursday": [{name: 'Dumbbell Rows', sets: 3, reps: '10-12', weight: 'Light'}],
      "Friday": [{name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', weight: 'Light'}]
    }
  },
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    description: 'A 3-week plan for beginners to get started with weightlifting.',
    duration: '3 Weeks',
    focus: 'Full Body',
    difficulty: 'easy',
    exercises: {
      "Monday": [{name: 'Dumbbell Rows', sets: 3, reps: '10-12', weight: 'Light'}],
      "Tuesday": [{name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', weight: 'Light'}],
      "Wednesday": [{name: 'Bodyweight Squats', sets: 3, reps: '15-20', weight: 'Bodyweight'}],
      "Thursday": [{name: 'Dumbbell Rows', sets: 3, reps: '10-12', weight: 'Light'}],
      "Friday": [{name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', weight: 'Light'}]
    }
  },
];

// TrainingPlansSection component to encapsulate the training plans logic
const TrainingPlansSection = ({
  recommendedPlan,
  currentWeek,
  handlePrevWeek,
  handleNextWeek,
  handleReplaceExercise,
  handleLogWorkout,
  selectedDay,
  workoutLogForms
}: {
  recommendedPlan: string | null;
  currentWeek: number;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  handleReplaceExercise: (exerciseName: string, replacementExercise: string) => Promise<void>;
  handleLogWorkout: (exerciseName: string, logData: any) => Promise<void>;
  selectedDay: string;
  workoutLogForms: any;
}) => {
  const alternativeExercises = {
    "Bench Press": ["Dumbbell Bench Press", "Incline Bench Press", "Decline Bench Press"],
    "Overhead Press": ["Dumbbell Shoulder Press", "Arnold Press", "Lateral Raises"],
    "Pull-ups": ["Lat Pulldowns", "Dumbbell Rows", "Barbell Rows"],
    "Barbell Rows": ["Dumbbell Rows", "Cable Rows", "T-Bar Rows"],
    "Push Press": ["Dumbbell Push Press", "Arnold Press", "Front Raises"],
    "Squats": ["Leg Press", "Lunges", "Goblet Squats"],
    "Deadlifts": ["Romanian Deadlifts", "Sumo Deadlifts", "Good Mornings"],
    "Leg Press": ["Hack Squats", "Lunges", "Bulgarian Split Squats"],
    "Hamstring Curls": ["Romanian Deadlifts", "Good Mornings", "Glute Bridges"],
    "Calf Raises": ["Seated Calf Raises", "Donkey Calf Raises", "Leg Press Calf Raises"],
    "Dumbbell Rows": ["Barbell Rows", "Cable Rows", "T-Bar Rows"],
    "Dumbbell Bench Press": ["Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press"],
    "Bodyweight Squats": ["Squats", "Lunges", "Jump Squats"],
    "Goblet Squats": ["Squats", "Leg Press", "Lunges"],
  };

  const getRecommendedPlans = () => {
    if (!recommendedPlan) return [];
    return recommendedPlan.split(',').map(planId => trainingPlans.find(p => p.id === planId)).filter(Boolean);
  };

  const getExercisesForDay = (selectedPlan: any, day: string) => {
      if (!selectedPlan) return [];

      const plan = trainingPlans.find(p => p.id === selectedPlan);
      if (!plan) return [];

      return plan.exercises[day] || [];
    };

  return (
    <>
      {recommendedPlan && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Training Plans</CardTitle>
              <CardDescription>
                Based on your input, here are the recommended training plans:
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getRecommendedPlans().map((plan) => {
                const currentExercises = getExercisesForDay(plan.id, selectedDay);

                return (
                  <div key={plan.id} className="mb-4">
                    <h3 className="text-xl font-semibold">{plan.name} ({plan.difficulty})</h3>
                    <p>{plan.description}</p>
                    <p>Follow the exercises below for week {currentWeek}, {selectedDay}:</p>
                    <ul>
                      {currentExercises.map((exercise, index) => (
                        <li key={index} className="flex items-center justify-between py-2">
                            <div>
                              {exercise.name} - {exercise.sets} sets, {exercise.reps} reps @ {exercise.weight}
                            </div>

                            <div className="flex gap-2">
                              <Select>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Replace Exercise"/>
                                </SelectTrigger>
                                <SelectContent>
                                  {alternativeExercises[exercise.name] && alternativeExercises[exercise.name].map((altExercise, idx) => (
                                    <SelectItem
                                      key={idx}
                                      value={altExercise}
                                      onClick={() => handleReplaceExercise(exercise.name, altExercise)}
                                    >
                                      {altExercise}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Form {...workoutLogForms[exercise.name]}>
                                <form onSubmit={workoutLogForms[exercise.name].handleSubmit((values) => handleLogWorkout(exercise.name, values))} className="space-y-2">
                                  <FormField
                                    control={workoutLogForms[exercise.name].control}
                                    name="sets"
                                    render={({field}) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input placeholder="Sets" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={workoutLogForms[exercise.name].control}
                                    name="reps"
                                    render={({field}) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input placeholder="Reps" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={workoutLogForms[exercise.name].control}
                                    name="weight"
                                    render={({field}) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input placeholder="Weight" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={workoutLogForms[exercise.name].control}
                                    name="date"
                                    render={({field}) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input type="date" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <Button type="submit" size="sm">
                                    Log Workout
                                  </Button>
                                </form>
                              </Form>
                            </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between mt-4">
                      <Button onClick={handlePrevWeek} disabled={currentWeek === 1}>
                        Previous Week
                      </Button>
                      <Button onClick={handleNextWeek}>
                        Next Week
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      )}
    </>
  );
};

// Main component
export default function Home() {
  const {toast} = useToast();

  // Add state to check if it's client side
  const [isClient, setIsClient] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Track selected training plan
  const [exerciseProgress, setExerciseProgress] = useState<{
    [exerciseName: string]: boolean;
  }>({}); // Track individual exercise progress
  const [historicalWorkouts, setHistoricalWorkouts] = useState<GetHistoricalWorkoutsOutput | null>(null);
  const [historicalDataLoading, setHistoricalDataLoading] = useState(false);

  const [isOnboarding, setIsOnboarding] = useState(true); // Track onboarding state
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null); // Track recommended plan
  const [currentWeek, setCurrentWeek] = useState(1); // Track current week of the program
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Track settings state

  const workoutLogFormsMemo = useMemo(() => {
    const forms = {};
    trainingPlans.forEach(plan => {
      if (plan.exercises) {
        Object.values(plan.exercises).forEach(exercisesForDay => {
          exercisesForDay.forEach(exercise => {
            if (!forms[exercise.name]) {
              forms[exercise.name] = useForm<z.infer<typeof workoutLogSchema>>({
                defaultValues: {
                  sets: '',
                  reps: '',
                  weight: '',
                  date: new Date().toISOString().slice(0, 10),
                },
              });
            }
          });
        });
      }
    });
    return forms;
  }, []);

    // Handlers for previous and next week buttons
    const handlePrevWeek = () => {
      setCurrentWeek(prevWeek => Math.max(prevWeek - 1, 1));
    };

    const handleNextWeek = () => {
      setCurrentWeek(prevWeek => prevWeek + 1);
    };

  // Onboarding form
  const onboardingForm = useForm<z.infer<typeof onboardingSchema>>({
    defaultValues: {
      fitnessGoals: 'build-muscle',
      focus: 'upper',
    },
  });

  // Handler for onboarding form submission
  const handleOnboardingSubmit = (values: z.infer<typeof onboardingSchema>) => {
    // Basic logic to recommend a plan (can be improved with AI)
    const recommendedPlans = trainingPlans.filter(plan =>
      plan.focus.toLowerCase().includes(values.focus.toLowerCase())
    );

    // Sort plans by difficulty: easy, medium, hard
    const sortedPlans = recommendedPlans.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    setRecommendedPlan(sortedPlans.map(plan => plan.id).join(',')); // Store all recommended plans
    setIsOnboarding(false);
    toast({
      title: 'Onboarding Complete',
      description: 'Recommended plans have been set.',
    });
  };

  // Function to get the exercises for the current week
  const getExercisesForWeek = () => {
    if (!selectedPlan) return [];

    const plan = trainingPlans.find(p => p.id === selectedPlan);
    if (!plan) return [];

    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    // For simplicity, assume exercises are the same each week
    return plan.exercises[dayOfWeek] || [];
  };

    const handleReplaceExercise = async (exerciseName: string, replacementExercise: string) => {
      toast({
        title: 'Exercise Replaced',
        description: `${exerciseName} replaced with ${replacementExercise}.`,
      });
    };

    const handleLogWorkout = async (exerciseName: string, logData: any) => {
      //fetch historical data if exercise name matches;
      // Update historical data (replace with actual data storage logic)
      toast({
        title: 'Workout Logged',
        description: `Logged workout data for ${exerciseName}.`,
      });
    };

  const handleGetHistoricalData = async (exerciseName: string) => {
    setHistoricalDataLoading(true);
    try {
      const result = await getHistoricalWorkouts({exercise: exerciseName});
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

  const getRecommendedPlans = () => {
    if (!recommendedPlan) return [];
    return recommendedPlan.split(',').map(planId => trainingPlans.find(p => p.id === planId)).filter(Boolean);
  };
  
  useEffect(() => {
    setWorkoutLogForms(workoutLogFormsMemo);
  }, [workoutLogFormsMemo]);

  const getDayOfWeek = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }

  const [selectedDay, setSelectedDay] = useState(getDayOfWeek());

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">LiftAssist</h1>

      {/* Onboarding Section */}
      {isOnboarding ? (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to LiftAssist!</CardTitle>
              <CardDescription>
                Let's set up your profile to recommend the best training plan for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...onboardingForm}>
                <form onSubmit={onboardingForm.handleSubmit(handleOnboardingSubmit)} className="space-y-4">
                  <FormField
                    control={onboardingForm.control}
                    name="fitnessGoals"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Fitness Goals</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="build-muscle">Build Muscle</SelectItem>
                            <SelectItem value="lose-weight">Lose Weight</SelectItem>
                            <SelectItem value="increase-strength">Increase Strength</SelectItem>
                            <SelectItem value="improve-endurance">Improve Endurance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>What do you want to achieve?</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={onboardingForm.control}
                    name="focus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Focus</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a focus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="upper">Upper Body</SelectItem>
                            <SelectItem value="lower">Lower Body</SelectItem>
                            <SelectItem value="full">Full Body</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>What area do you want to focus on?</FormDescription>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Get Recommended Plan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {isClient && (
            <TrainingPlansSection
              recommendedPlan={recommendedPlan}
              currentWeek={currentWeek}
              handlePrevWeek={handlePrevWeek}
              handleNextWeek={handleNextWeek}
              handleReplaceExercise={handleReplaceExercise}
              handleLogWorkout={handleLogWorkout}
              selectedDay={selectedDay}
              workoutLogForms={workoutLogForms}
            />
          )}

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
        </>
      )}
    </div>
  );
}
