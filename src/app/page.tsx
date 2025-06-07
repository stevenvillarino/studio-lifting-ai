'use client';

import {useState, useEffect} from 'react'; // Removed unused useMemo, useRef
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { trainingPlans } from '@/data/trainingPlans';
import { TrainingPlansDisplay } from '@/components/training/TrainingPlansDisplay';
import { HistoricalWorkouts } from '@/components/history/HistoricalWorkouts';
import { getHistoricalWorkouts, GetHistoricalWorkoutsOutput } from '@/ai/flows/get-historical-workouts';
import MermaidDiagram from '@/components/ui/MermaidDiagram'; // Added import
// import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Button} from '@/components/ui/button'; // Uncommented for test button
// import {Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card';
// import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from '@/components/ui/form';
// import {Input} from '@/components/ui/input';
// import {Label} from '@/components/ui/label';
// import {Skeleton} from '@/components/ui/skeleton';
// import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
// import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast'; // Ensure this is uncommented
// import {cn} from '@/lib/utils';
// import {CheckCircle, Circle, Dumbbell, Loader2, Settings} from 'lucide-react';
// import {useForm} from 'react-hook-form';
// import {z} from 'zod';
// import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
// import {CardTitle} from "@/components/ui/card"

// Define schemas for forms and data structures
/*
const workoutLogSchema = z.object({
  sets: z.string(),
  reps: z.string(),
  weight: z.string(),
  date: z.string()
});
*/

// Define onboarding schema
/*
const onboardingSchema = z.object({
  fitnessGoals: z.string(),
  focus: z.string(),
});
*/

// TrainingPlansSection component to encapsulate the training plans logic
/*
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
  // const alternativeExercises = { ... }; // Moved to src/data/alternativeExercises.ts

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
        <Card>
          <CardHeader>
            <CardTitle>
              Recommended Training Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            Based on your input, here are the recommended training plans:
          </CardContent>
        </Card>
      )}
    </>
  );
};
*/

// Moved getDayOfWeek function before its use
const getDayOfWeek = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

// Main component
export default function Home() {
  const {toast} = useToast(); // Uncommented

  // Add state to check if it's client side
  const [isClient, setIsClient] = useState(false);

  // const [loading, setLoading] = useState(false);
  // const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Track selected training plan
  // const [exerciseProgress, setExerciseProgress] = useState<Record<string, any>>({}); // Track individual exercise progress
  const [historicalWorkouts, setHistoricalWorkouts] = useState<GetHistoricalWorkoutsOutput | null>(null); // Uncommented
  const [historicalDataLoading, setHistoricalDataLoading] = useState(false); // Keep this for now, might be used later

  const [isOnboarding, setIsOnboarding] = useState(true); // Uncommented
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null); // Uncommented
  // const [currentWeek, setCurrentWeek] = useState(1); // Track current week of the program
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Track settings state

  const [selectedDay, setSelectedDay] = useState<string>(() => getDayOfWeek()); // Typed useState, selectedDay might be used later
  // const [loggingEnabled, setLoggingEnabled] = useState(false);
  // const [alternativeExerciseModalOpen, setAlternativeExerciseModalOpen] = useState(false);

  // const [muscleGroups, setMuscleGroups] = useState(['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']);

  // Removed workoutLogForms, workoutLogFormsMemo, and related useEffect

  // Handlers for previous and next week buttons
  /*
  const handlePrevWeek = () => {
    setCurrentWeek(prevWeek => Math.max(prevWeek - 1, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prevWeek => prevWeek + 1);
  };
  */

  // Onboarding form
  /*
  const onboardingForm = useForm({
    defaultValues: {
      fitnessGoals: 'build-muscle',
      focus: 'upper',
    },
  });
  */

  // Handler for onboarding form submission
  const handleOnboardingComplete = (values: { fitnessGoals: string; focus: string }) => {
    // Logic from original handleOnboardingSubmit
    // This requires trainingPlans to be defined in this file for now
    const recommended = trainingPlans.filter(plan =>
      plan.focus.toLowerCase().includes(values.focus.toLowerCase())
    );
    const sortedPlans = recommended.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }  as Record<string, number>; // Added type assertion
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
    setRecommendedPlan(sortedPlans.map(plan => plan.id).join(','));
    setIsOnboarding(false);
    toast({
      title: 'Onboarding Complete',
      description: 'Recommended plans have been set.',
    });
  };


  // Function to get the exercises for the current week
  /*
  const getExercisesForWeek = () => {
    if (!selectedPlan) return [];

    const plan = trainingPlans.find(p => p.id === selectedPlan);
    if (!plan) return [];

    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    // For simplicity, assume exercises are the same each week
    return plan.exercises[dayOfWeek] || [];
  };
  */

  /*
  const handleReplaceExercise = async (exerciseName, replacementExercise) => {
    toast({
      title: 'Exercise Replaced',
      description: `${exerciseName} replaced with ${replacementExercise}.`,
    });
  };
  */

  /*
  const handleLogWorkout = async (exerciseName, logData) => {
    //fetch historical data if exercise name matches;
    // Update historical data (replace with actual data storage logic)
    toast({
      title: 'Workout Logged',
      description: `Logged workout data for ${exerciseName}.`,
    });
  };
  */

  // Uncommented handleGetHistoricalData
  const handleGetHistoricalData = async (exerciseName: string) => {
    setHistoricalDataLoading(true);
    setHistoricalWorkouts(null); // Clear previous results
    try {
      const result = await getHistoricalWorkouts({exercise: exerciseName});
      setHistoricalWorkouts(result);
    } catch (error) {
      toast({
        title: 'Error fetching history',
        description: (error as Error).message || 'Failed to retrieve historical workout data.',
        variant: 'destructive',
      });
    } finally {
      setHistoricalDataLoading(false);
    }
  };

  /*
  const getRecommendedPlans = () => {
    if (!recommendedPlan) return [];
    return recommendedPlan.split(',').map(planId => trainingPlans.find(p => p.id === planId)).filter(Boolean);
  };
  */

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // This useEffect is for isClient, no longer for workoutLogForms
    if (isClient) {
      // Potential future client-side only logic can go here
    }
  }, [isClient]);
  

  return (
    <div>
      {isOnboarding ? (
        <OnboardingForm onSubmit={handleOnboardingComplete} />
      ) : (
        <div>
          <h2>Onboarding Complete!</h2>
          <TrainingPlansDisplay recommendedPlanIds={recommendedPlan} allTrainingPlans={trainingPlans} />
          {/* Example: Button to trigger historical data fetching for a mock exercise */}
          <Button onClick={() => handleGetHistoricalData('Bench Press')} className="my-4">
            Fetch Bench Press History
          </Button>
          <HistoricalWorkouts historicalWorkouts={historicalWorkouts} isLoading={historicalDataLoading} />

          <h3>Mermaid Diagram Example:</h3>
          <MermaidDiagram chart={`graph TD;
    A-->B;
    B-->C;
    C-->A;`} />
        </div>
      )}
    </div>
  );
}
