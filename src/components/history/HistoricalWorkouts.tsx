'use client';

   import { GetHistoricalWorkoutsOutput } from '@/ai/flows/get-historical-workouts';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
   import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
   import { Skeleton } from '@/components/ui/skeleton';

   interface HistoricalWorkoutsProps {
     historicalWorkouts: GetHistoricalWorkoutsOutput | null;
     isLoading: boolean;
     // We might need a way to trigger loading or specify an exercise,
     // but for now, we'll just display what's passed.
     // onFetchData?: (exerciseName: string) => void;
   }

   export function HistoricalWorkouts({ historicalWorkouts, isLoading }: HistoricalWorkoutsProps) {
     if (isLoading) {
       return (
         <Card className="mb-8">
           <CardHeader>
             <Skeleton className="h-6 w-1/2" />
           </CardHeader>
           <CardContent>
             <Skeleton className="h-4 w-full mb-2" />
             <Skeleton className="h-4 w-3/4 mb-4" />
             <div className="space-y-2">
               <Skeleton className="h-8 w-full" />
               <Skeleton className="h-8 w-full" />
               <Skeleton className="h-8 w-full" />
             </div>
           </CardContent>
         </Card>
       );
     }

     if (!historicalWorkouts || historicalWorkouts.length === 0) {
       // Optionally, display a message if there's no data and not loading
       // For now, render nothing or a specific message if desired
       return <p className="mb-8">No historical workout data available for the selected exercise.</p>;
     }

     return (
       <Card className="mb-8">
         <CardHeader>
           <CardTitle>Historical Workout Data</CardTitle>
           <CardDescription>A history of your workouts for this exercise.</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableCaption>Historical workout data.</TableCaption>
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
           </Table>
         </CardContent>
       </Card>
     );
   }
