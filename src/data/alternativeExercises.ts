export interface ExerciseAlternatives {
  [exerciseName: string]: string[];
}

export const alternativeExercises: ExerciseAlternatives = {
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
