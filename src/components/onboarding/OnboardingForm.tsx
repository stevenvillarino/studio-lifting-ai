'use client';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';
   import { Button } from '@/components/ui/button';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
   import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
   import { useToast } from '@/hooks/use-toast';

   const onboardingSchema = z.object({
     fitnessGoals: z.string().min(1, 'Fitness goal is required'),
     focus: z.string().min(1, 'Training focus is required'),
   });

   type OnboardingFormValues = z.infer<typeof onboardingSchema>;

   interface OnboardingFormProps {
     onSubmit: (values: OnboardingFormValues) => void;
   }

   export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
     const { toast } = useToast(); // Keep toast here or move to parent? For now, keep here for immediate feedback.
     const onboardingForm = useForm<OnboardingFormValues>({
       resolver: zodResolver(onboardingSchema),
       defaultValues: {
         fitnessGoals: 'build-muscle', // Or pass as prop if needs to be dynamic
         focus: 'upper', // Or pass as prop
       },
     });

     const handleSubmit = (values: OnboardingFormValues) => {
       onSubmit(values);
       // Toast can also be called by the parent after successful state update.
       // toast({
       //   title: 'Onboarding Complete',
       //   description: 'Recommended plans have been set.',
       // });
     };

     return (
       <Card className="mb-8">
         <CardHeader>
           <CardTitle>Welcome to LiftAssist!</CardTitle>
           <CardDescription>
             Let&apos;s set up your profile to recommend the best training plan for you.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...onboardingForm}>
             <form onSubmit={onboardingForm.handleSubmit(handleSubmit)} className="space-y-6">
               <FormField
                 control={onboardingForm.control}
                 name="fitnessGoals"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Fitness Goals</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select your fitness goal" />
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
                     <FormMessage />
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
                           <SelectValue placeholder="Select your training focus" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="upper">Upper Body</SelectItem>
                         <SelectItem value="lower">Lower Body</SelectItem>
                         <SelectItem value="full">Full Body</SelectItem>
                       </SelectContent>
                     </Select>
                     <FormDescription>What area do you want to focus on?</FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button type="submit">Get Recommended Plan</Button>
             </form>
           </Form>
         </CardContent>
       </Card>
     );
   }
