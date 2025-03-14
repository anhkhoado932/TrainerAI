"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Dumbbell, Heart, Timer } from "lucide-react"
import { motion } from "framer-motion"

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

  return (
    <Card className={isCard ? "h-[400px]" : ""}>
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
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
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
                      className="flex items-center gap-4 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {exercise.sets} × {exercise.reps}
                        </Badge>
                        <Badge variant="secondary">
                          <Timer className="w-3 h-3 mr-1" />
                          {exercise.rest}
                        </Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
                            {workoutPlan.weeklySchedule[day].cardio.type}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {workoutPlan.weeklySchedule[day].cardio.duration}
                          </p>
                        </div>
                        <Badge>
                          {workoutPlan.weeklySchedule[day].cardio.intensity}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isCard && (
                  <motion.div variants={item} className="pt-6">
                    <Button size="lg" className="w-full">
                      Start Workout
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </Card>
  )
} 