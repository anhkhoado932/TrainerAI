"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, Plus, Minus, RotateCcw, CheckCircle, Timer, Dumbbell, Clock } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSearchParams } from "next/navigation"

interface TrackingPageProps {
  params: Promise<{
    exercise: string
  }>
}

// Exercise data structure from assessment form
interface ExerciseData {
  name: string
  sets: number
  "set-durations"?: number // in seconds
  rest: number
  notes?: string
}

// Default recommended sets and reps for different exercises
const EXERCISE_DEFAULTS: Record<string, ExerciseData> = {
  squat: { 
    name: "Squat", 
    sets: 3, 
    "set-durations": 45, // 45 seconds per set
    rest: 60,
    notes: "Keep your back straight and knees aligned with toes"
  },
  "push-up": { 
    name: "Push-up", 
    sets: 3, 
    "set-durations": 30,
    rest: 45,
    notes: "Maintain a straight line from head to heels"
  },
  "pull-up": { 
    name: "Pull-up", 
    sets: 3, 
    "set-durations": 30,
    rest: 90,
    notes: "Pull your chest to the bar, not your chin"
  },
  lunge: { 
    name: "Lunge", 
    sets: 3, 
    "set-durations": 45,
    rest: 45,
    notes: "Keep your front knee at 90 degrees and back knee just above the ground"
  },
  plank: { 
    name: "Plank", 
    sets: 3, 
    "set-durations": 60, // 60 seconds hold
    rest: 60,
    notes: "Engage your core and maintain a straight line from head to heels"
  },
  "bench-press": { 
    name: "Bench Press", 
    sets: 4, 
    "set-durations": 40,
    rest: 90,
    notes: "Keep your feet flat on the floor and maintain a slight arch in your back"
  },
  deadlift: { 
    name: "Deadlift", 
    sets: 3, 
    "set-durations": 45,
    rest: 120,
    notes: "Hinge at the hips and keep your back straight throughout the movement"
  },
  // Add more exercises as needed
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const { exercise } = unwrappedParams
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  // Get exercise data from URL params or use defaults
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Tracking state
  const [currentSet, setCurrentSet] = useState(1)
  const [setTimeRemaining, setSetTimeRemaining] = useState(0)
  const [isPerformingSet, setIsPerformingSet] = useState(false)
  const [completedSets, setCompletedSets] = useState<number[]>([])
  const [isResting, setIsResting] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [workoutComplete, setWorkoutComplete] = useState(false)
  
  // Format the exercise name for display (convert from URL format)
  const exerciseName = exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Load exercise data
  useEffect(() => {
    const loadExerciseData = async () => {
      try {
        // Try to get exercise data from user's workout plan in Supabase
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: workoutPlan } = await supabase
            .from('workout_plans')
            .select('plan')
            .eq('user_id', user.id)
            .single()
            
          if (workoutPlan?.plan) {
            // Search for the exercise in the workout plan
            const plan = workoutPlan.plan
            let foundExercise: ExerciseData | null = null
            
            // Look through each day in the weekly schedule
            Object.values(plan.weeklySchedule || {}).forEach((day: any) => {
              const exercises = day.exercises || []
              const match = exercises.find((ex: any) => 
                ex.name.toLowerCase() === exerciseName.toLowerCase()
              )
              if (match) {
                foundExercise = {
                  name: match.name,
                  sets: match.sets,
                  "set-durations": match["set-durations"] || 45, // Default to 45 seconds if not specified
                  rest: typeof match.rest === 'string' ? parseInt(match.rest) || 60 : match.rest || 60,
                  notes: match.notes
                }
              }
            })
            
            if (foundExercise) {
              setExerciseData(foundExercise)
              setSetTimeRemaining(foundExercise["set-durations"] || 45)
              setRestTimeRemaining(foundExercise.rest)
              setLoading(false)
              return
            }
          }
        }
        
        // Fallback to defaults if no data found in Supabase
        const defaultData = EXERCISE_DEFAULTS[exercise] || {
          name: exerciseName,
          sets: 3,
          "set-durations": 45,
          rest: 60,
          notes: "Focus on proper form"
        }
        
        setExerciseData(defaultData)
        setSetTimeRemaining(defaultData["set-durations"] || 45)
        setRestTimeRemaining(defaultData.rest)
        setLoading(false)
      } catch (error) {
        console.error("Error loading exercise data:", error)
        // Fallback to defaults on error
        const defaultData = EXERCISE_DEFAULTS[exercise] || {
          name: exerciseName,
          sets: 3,
          "set-durations": 45,
          rest: 60,
          notes: "Focus on proper form"
        }
        
        setExerciseData(defaultData)
        setSetTimeRemaining(defaultData["set-durations"] || 45)
        setRestTimeRemaining(defaultData.rest)
        setLoading(false)
      }
    }
    
    loadExerciseData()
  }, [exercise, exerciseName, supabase])

  // Handle set timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPerformingSet && setTimeRemaining > 0) {
      timer = setInterval(() => {
        setSetTimeRemaining(prev => {
          if (prev <= 1) {
            // Set is complete
            setIsPerformingSet(false);
            completeSet();
            return exerciseData?.["set-durations"] || 45; // Reset for next set
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPerformingSet, setTimeRemaining, exerciseData]);

  // Handle rest timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isResting && restTimeRemaining > 0) {
      timer = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            // Rest period is over
            setIsResting(false);
            // Reset rest time for next set
            return exerciseData?.rest || 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isResting, restTimeRemaining, exerciseData]);

  // Start the current set
  const startSet = () => {
    setIsPerformingSet(true);
    toast.info(`Set ${currentSet} started! Keep going for ${formatTime(setTimeRemaining)}`);
  };

  // Complete current set
  const completeSet = () => {
    // Add current set to completed sets with the duration performed
    setCompletedSets(prev => [...prev, setTimeRemaining]);
    
    // Check if all sets are completed
    if (currentSet >= (exerciseData?.sets || 3)) {
      setWorkoutComplete(true);
      setIsPerformingSet(false);
      toast.success("Workout completed! Great job!");
      return;
    }
    
    // Move to next set
    setCurrentSet(prev => prev + 1);
    setIsPerformingSet(false);
    setIsResting(true);
    
    toast.success(`Set ${currentSet} completed! Rest for ${formatTime(restTimeRemaining)}`);
  };

  // Skip the current set
  const skipSet = () => {
    if (isPerformingSet) {
      setIsPerformingSet(false);
      completeSet();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete workout and return to workout page
  const finishWorkout = () => {
    router.push('/workout');
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 space-y-8">
        <Card className="border-green-500/20">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading exercise data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <Card className="border-[#F26430]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {exerciseName} Tracker
              </CardTitle>
              <CardDescription className="mt-2">
                Track your sets to complete your workout
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentSet} / {exerciseData?.sets || 3} Sets
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{completedSets.length} of {exerciseData?.sets || 3} sets completed</span>
            </div>
            <Progress 
              value={(completedSets.length / (exerciseData?.sets || 3)) * 100} 
              className="h-2"
            />
          </div>
          
          {workoutComplete ? (
            <div className="bg-[#F26430]/10 p-8 rounded-lg border border-[#F26430]/20 text-center">
              <CheckCircle className="w-16 h-16 text-[#F26430] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Workout Complete!</h3>
              <p className="text-muted-foreground mb-6">
                You've completed all {exerciseData?.sets || 3} sets of {exerciseName}. Great job!
              </p>
              <Button 
                className="bg-[#F26430] hover:bg-[#F26430]/90"
                onClick={finishWorkout}
              >
                Finish Workout
              </Button>
            </div>
          ) : isResting ? (
            <div className="bg-[#F26430]/10 p-8 rounded-lg border border-[#F26430]/20 text-center">
              <Timer className="w-16 h-16 text-[#F26430] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Rest Time</h3>
              <p className="text-muted-foreground mb-2">
                Take a break before your next set
              </p>
              <div className="text-4xl font-bold text-[#F26430] mb-6">
                {formatTime(restTimeRemaining)}
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsResting(false);
                  setRestTimeRemaining(exerciseData?.rest || 60);
                }}
              >
                Skip Rest
              </Button>
            </div>
          ) : isPerformingSet ? (
            <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-lg border border-green-200 dark:border-green-900 text-center">
              <Clock className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Set in Progress</h3>
              <p className="text-muted-foreground mb-2">
                Keep going! Maintain proper form
              </p>
              <div className="text-4xl font-bold text-green-500 mb-6">
                {formatTime(setTimeRemaining)}
              </div>
              <Button 
                variant="outline"
                onClick={skipSet}
              >
                Complete Early
              </Button>
            </div>
          ) : (
            <>
              {/* Current Set Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border text-center">
                  <h3 className="text-lg font-medium mb-2">Current Set</h3>
                  <div className="text-5xl font-bold text-[#F26430] mb-2">{currentSet}</div>
                  <p className="text-sm text-muted-foreground">of {exerciseData?.sets || 3} sets</p>
                </div>
                
                <div className="p-6 rounded-lg border text-center">
                  <h3 className="text-lg font-medium mb-2">Set Duration</h3>
                  <div className="text-5xl font-bold text-[#F26430] mb-2">{formatTime(exerciseData?.["set-durations"] || 45)}</div>
                  <p className="text-sm text-muted-foreground">per set</p>
                </div>
              </div>
              
              {/* Set Controls */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg border">
                <h3 className="text-lg font-medium text-center mb-6">Ready for Set {currentSet}</h3>
                
                <div className="flex justify-center mt-4">
                  <Button 
                    className="bg-[#F26430] hover:bg-[#F26430]/90 flex items-center gap-2 px-8 py-6 text-lg"
                    onClick={startSet}
                  >
                    <Timer className="h-5 w-5" />
                    Start Set
                  </Button>
                </div>
                
                {exerciseData?.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium mb-1">Form Tips:</h4>
                    <p className="text-sm text-muted-foreground">{exerciseData.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Completed Sets */}
              {completedSets.length > 0 && (
                <div className="p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Completed Sets</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {completedSets.map((duration, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-center"
                      >
                        <div className="text-sm font-medium">Set {index + 1}</div>
                        <div className="text-xl font-bold text-green-600">{formatTime(exerciseData?.["set-durations"] || 45)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            asChild
            disabled={isPerformingSet || isResting}
          >
            <Link href={`/workout/start/${exercise}/results`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Link>
          </Button>
          
          {!workoutComplete && !isPerformingSet && !isResting && (
            <Button 
              className="bg-[#F26430] hover:bg-[#F26430]/90"
              onClick={finishWorkout}
            >
              Skip to Finish
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Exercise Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {exerciseName} Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            <li>Maintain proper form throughout each set</li>
            <li>Focus on controlled movements rather than speed</li>
            <li>Breathe out during the exertion phase</li>
            <li>Keep your core engaged for stability</li>
            <li>If you feel pain (not muscle fatigue), stop immediately</li>
            {exerciseData?.notes && <li className="font-medium">{exerciseData.notes}</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 