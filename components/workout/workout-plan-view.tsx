"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Dumbbell, Heart, Lock, Play, Timer } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface WorkoutPlan {
  overview: string
  weeklySchedule: {
    [key: string]: {
      exercises: {
        name: string
        sets: number
        reps: string
        rest: string
        notes?: string
      }[]
      cardio?: {
        type: string
        duration: string
        intensity: string
      }
    }
  }
  nutrition: {
    dailyCalories: number
    macros: {
      protein: number
      carbs: number
      fats: number
    }
    recommendations: string[]
  }
}

interface WorkoutPlanViewProps {
  workoutPlan: WorkoutPlan
  isCard?: boolean
}

export function WorkoutPlanView({ workoutPlan, isCard = false }: WorkoutPlanViewProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState("day1")
  const days = Object.keys(workoutPlan.weeklySchedule)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const handleStartExercise = (exerciseName: string) => {
    // Convert exercise name to URL-friendly format
    const formattedName = exerciseName.toLowerCase().replace(/\s+/g, '-')
    // Navigate to the exercise page
    router.push(`/workout/start/${formattedName}`)
  }

  const isPremiumExercise = (name: string) => {
    return name.toLowerCase() !== "squat"
  }

  return (
    <div className="flex justify-center items-center w-full">
      <Card className={`${isCard ? "h-[400px]" : ""} w-full max-w-3xl mx-auto`}>
        <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="h-full">
          <div className="flex items-center justify-between p-6 pb-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Your Workout Plan
              </h2>
              <p className="text-sm text-muted-foreground">
                {workoutPlan.overview}
              </p>
            </div>
          </div>
          <div className="px-6 pb-3">
            <TabsList className="grid grid-cols-7">
              {days.map((day, index) => (
                <TabsTrigger
                  key={day}
                  value={day}
                  className="data-[state=active]:bg-[#F26430]/20 data-[state=active]:text-[#F26430]"
                >
                  Day {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollArea className={isCard ? "h-[280px] px-6" : "h-[600px] px-6"}>
            {days.map((day) => (
              <TabsContent key={day} value={day} className="mt-0">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {/* Exercises Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Dumbbell className="w-5 h-5" />
                      Exercises
                    </h3>
                    {workoutPlan.weeklySchedule[day].exercises.map((exercise, index) => (
                      <motion.div
                        key={index}
                        variants={item}
                        className="flex flex-col p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="h-9 px-4 py-0 flex items-center justify-center font-medium text-sm">
                              {exercise.sets} <span className="mx-1">×</span> {exercise.reps}
                            </Badge>
                            <Badge variant="secondary" className="h-9 px-4 py-0 flex items-center justify-center text-sm">
                              <Timer className="w-4 h-4 mr-1.5" />
                              {exercise.rest}
                            </Badge>
                          </div>
                          {isPremiumExercise(exercise.name) ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-9 px-4 flex items-center justify-center gap-1.5 text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/10 whitespace-nowrap rounded-full"
                              disabled
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Start
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-9 px-4 flex items-center justify-center gap-1.5 text-[#F26430] border-[#F26430]/20 hover:bg-[#F26430]/10 hover:text-[#F26430]/90 whitespace-nowrap rounded-full"
                              onClick={() => handleStartExercise(exercise.name)}
                            >
                              <Play className="w-4 h-4" />
                              Start
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cardio Section */}
                  {workoutPlan.weeklySchedule[day].cardio && (
                    <motion.div variants={item} className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Cardio
                      </h3>
                      <div className="p-3 rounded-lg bg-card/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {workoutPlan.weeklySchedule[day].cardio?.type}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {workoutPlan.weeklySchedule[day].cardio?.duration}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="h-9 px-4 py-0 flex items-center justify-center text-sm">
                              {workoutPlan.weeklySchedule[day].cardio?.intensity}
                            </Badge>
                            {isPremiumExercise(workoutPlan.weeklySchedule[day].cardio?.type || "") ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 px-4 flex items-center justify-center gap-1.5 text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/10 whitespace-nowrap rounded-full"
                                disabled
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Premium only
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 px-4 flex items-center justify-center gap-1.5 text-[#F26430] border-[#F26430]/20 hover:bg-[#F26430]/10 hover:text-[#F26430]/90 whitespace-nowrap rounded-full"
                                onClick={() => workoutPlan.weeklySchedule[day].cardio && handleStartExercise(workoutPlan.weeklySchedule[day].cardio.type)}
                              >
                                <Play className="w-4 h-4" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!isCard && (
                    <motion.div variants={item} className="pt-6">
                      <Button size="lg" className="w-full bg-[#F26430] hover:bg-[#F26430]/90">
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  )
} 