'use client';

   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

   // Define the structure of a single training plan based on trainingPlans.ts
   // This should match the structure in src/data/trainingPlans.ts
   interface Exercise {
     name: string;
     sets: number | string; // string for "As many as possible"
     reps: string;
     weight: string;
   }

   interface DailyExercises {
     [day: string]: Exercise[];
   }

   interface TrainingPlan {
     id: string;
     name: string;
     description: string;
     duration: string;
     focus: string;
     difficulty: 'easy' | 'medium' | 'hard';
     exercises: DailyExercises;
   }

   interface TrainingPlansDisplayProps {
     recommendedPlanIds: string | null; // Comma-separated IDs
     allTrainingPlans: TrainingPlan[];
   }

   export function TrainingPlansDisplay({ recommendedPlanIds, allTrainingPlans }: TrainingPlansDisplayProps) {
     if (!recommendedPlanIds) {
       return null;
     }

     const planIdsToShow = recommendedPlanIds.split(',');
     const recommendedPlans = allTrainingPlans.filter(plan => planIdsToShow.includes(plan.id));

     if (recommendedPlans.length === 0) {
       return <p>No recommended plans found for the provided IDs.</p>;
     }

     return (
       <div className="space-y-4">
         {recommendedPlans.map((plan) => (
           <Card key={plan.id} className="mb-8">
             <CardHeader>
               <CardTitle>{plan.name}</CardTitle>
             </CardHeader>
             <CardContent>
               <p>{plan.description}</p>
               <p><strong>Duration:</strong> {plan.duration}</p>
               <p><strong>Focus:</strong> {plan.focus}</p>
               <p><strong>Difficulty:</strong> {plan.difficulty}</p>
               {/* Future: Display exercises if needed */}
             </CardContent>
           </Card>
         ))}
       </div>
     );
   }
