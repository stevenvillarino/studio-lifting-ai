'use client';

import {useState, useEffect, useMemo, useRef} from 'react';

import {getHistoricalWorkouts, GetHistoricalWorkoutsOutput} from '@/ai/flows/get-historical-workouts';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card';
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
import {CardTitle} from "@/components/ui/card"

// Define schemas for forms and data structures
const workoutLogSchema = z.object({
  sets: z.string(),
  reps: z.string(),
  weight: z.string(),
  date: z.string()
});

// Define onboarding schema
const onboardingSchema = z.object({
  fitnessGoals: z.string(),
  focus: z.string(),
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
    
      {recommendedPlan && (
        
          
            
              
                
                  
                    Recommended Training Plans
                  
                
              
              
                
                  Based on your input, here are the recommended training plans:
                
              
            
            
              {getRecommendedPlans().map((plan) => {
                const currentExercises = getExercisesForDay(plan.id, selectedDay);

                return (
                  
                    
                      {plan.name} ({plan.difficulty})
                    
                    {plan.description}
                    Follow the exercises below for week {currentWeek}, {selectedDay}:
                    
                      {currentExercises.map((exercise, index) => (
                        
                            
                              {exercise.name} - {exercise.sets} sets, {exercise.reps} reps @ {exercise.weight}
                            
                            
                              
                                
                                  
                                    
                                      
                                        
                                      
                                    
                                  
                                  
                                    {alternativeExercises[exercise.name] && alternativeExercises[exercise.name].map((altExercise, idx) => (
                                      
                                        {altExercise}
                                      
                                    ))}
                                  
                                
                              
                              
                                
                                  
                                    
                                      
                                        
                                      
                                    
                                  
                                  
                                    
                                      
                                        
                                      
                                    
                                  
                                  
                                    
                                      
                                        
                                      
                                    
                                  
                                  
                                    Log Workout
                                  
                                
                              
                            
                        
                      ))}
                    
                    
                      
                        Previous Week
                      
                      
                        Next Week
                      
                    
                  
                );
              })}
            
          
        
      )}
    
  );
};

// Main component
export default function Home() {
  const {toast} = useToast();

  // Add state to check if it's client side
  const [isClient, setIsClient] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // Track selected training plan
  const [exerciseProgress, setExerciseProgress] = useState({}); // Track individual exercise progress
  const [historicalWorkouts, setHistoricalWorkouts] = useState(null);
  const [historicalDataLoading, setHistoricalDataLoading] = useState(false);

  const [isOnboarding, setIsOnboarding] = useState(true); // Track onboarding state
  const [recommendedPlan, setRecommendedPlan] = useState(null); // Track recommended plan
  const [currentWeek, setCurrentWeek] = useState(1); // Track current week of the program
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Track settings state

  const [selectedDay, setSelectedDay] = useState(getDayOfWeek());
  const [loggingEnabled, setLoggingEnabled] = useState(false);
  const [alternativeExerciseModalOpen, setAlternativeExerciseModalOpen] = useState(false);

  const [muscleGroups, setMuscleGroups] = useState(['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']);

  // Initialize workoutLogForms within the component
  const [workoutLogForms, setWorkoutLogForms] = useState(() => {
    const initialForms = {};
    trainingPlans.forEach(plan => {
      if (plan.exercises) {
        Object.values(plan.exercises).forEach(exercisesForDay => {
          exercisesForDay.forEach(exercise => {
            if (!initialForms[exercise.name]) {
              initialForms[exercise.name] = useForm({
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
    return initialForms;
  });

  const workoutLogFormsMemo = useMemo(() => {
    return workoutLogForms;
  }, [workoutLogForms]);

  // Handlers for previous and next week buttons
  const handlePrevWeek = () => {
    setCurrentWeek(prevWeek => Math.max(prevWeek - 1, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prevWeek => prevWeek + 1);
  };

  // Onboarding form
  const onboardingForm = useForm({
    defaultValues: {
      fitnessGoals: 'build-muscle',
      focus: 'upper',
    },
  });

  // Handler for onboarding form submission
  const handleOnboardingSubmit = (values) => {
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

  const handleReplaceExercise = async (exerciseName, replacementExercise) => {
    toast({
      title: 'Exercise Replaced',
      description: `${exerciseName} replaced with ${replacementExercise}.`,
    });
  };

  const handleLogWorkout = async (exerciseName, logData) => {
    //fetch historical data if exercise name matches;
    // Update historical data (replace with actual data storage logic)
    toast({
      title: 'Workout Logged',
      description: `Logged workout data for ${exerciseName}.`,
    });
  };

  const handleGetHistoricalData = async (exerciseName) => {
    setHistoricalDataLoading(true);
    try {
      const result = await getHistoricalWorkouts({exercise: exerciseName});
      setHistoricalWorkouts(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to retrieve historical workout data.',
        variant: 'destructive',
      });
    } finally {
      setHistoricalDataLoading = false;
    }
  };

  const getRecommendedPlans = () => {
    if (!recommendedPlan) return [];
    return recommendedPlan.split(',').map(planId => trainingPlans.find(p => p.id === planId)).filter(Boolean);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Ensure workoutLogForms are updated only after they are initialized
    if (isClient) {
      setWorkoutLogForms(workoutLogFormsMemo);
    }
  }, [isClient, workoutLogFormsMemo]);
  

  const getDayOfWeek = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }


  return (
    
      
        LiftAssist
      

      {/* Onboarding Section */}
      {isOnboarding ? (
        
          
            
              Welcome to LiftAssist!
            
            
              Let's set up your profile to recommend the best training plan for you.
            
          
          
            
              
                Fitness Goals
                
                  
                    
                      
                    
                  
                  
                    Build Muscle
                    Lose Weight
                    Increase Strength
                    Improve Endurance
                  
                
                What do you want to achieve?
              
              
                Training Focus
                
                  
                    
                      
                    
                  
                  
                    Upper Body
                    Lower Body
                    Full Body
                  
                
                What area do you want to focus on?
              
              
                Get Recommended Plan
              
            
          
        
      ) : (
        
          
            
          
          

          {/* Historical Data Section */}
          
            {historicalWorkouts ? (
              
                
                  Historical Workout Data
                
                
                  A history of your workouts for this exercise.
                
                
                  
                    
                      Date
                      Sets
                      Reps
                      Weight (lbs)
                    
                    
                      {historicalWorkouts.map((workout, index) => (
                        
                          
                            {workout.date}
                          
                          
                            {workout.sets}
                          
                          
                            {workout.reps}
                          
                          
                            {workout.weight}
                          
                        
                      ))}
                    
                    
                      Historical workout data.
                    
                  
                
              
            ) : historicalDataLoading ? (
              
            ) : null}
          
        
      )}
    
  );
}





