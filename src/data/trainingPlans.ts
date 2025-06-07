// Define training plans

// This structure should match the TrainingPlan interface in TrainingPlansDisplay.tsx
interface Exercise {
  name: string;
  sets: number | string; // string for "As many as possible"
  reps: string;
  weight: string;
}

interface DailyExercises {
  [day: string]: Exercise[];
}

export interface TrainingPlan { // Exporting for potential use elsewhere, though not strictly needed just for this file
  id: string;
  name: string;
  description: string;
  duration: string;
  focus: string;
  difficulty: 'easy' | 'medium' | 'hard'; // This ensures type conformity
  exercises: DailyExercises;
}

export const trainingPlans: TrainingPlan[] = [
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
