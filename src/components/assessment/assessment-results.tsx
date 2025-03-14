"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface AssessmentResultsProps {
  assessment: Record<string, string>
  workoutPlan: any // Using any here since the workout plan structure is complex
}

const ASSESSMENT_LABELS: Record<string, string> = {
  "primary-goal": "Primary Goal",
  "gender": "Gender",
  "age": "Age Group",
  "fitness-level": "Fitness Level",
  "training-access": "Training Location",
  "frequency": "Weekly Frequency",
  "diet": "Diet Preference"
}

export function AssessmentResults({ assessment, workoutPlan }: AssessmentResultsProps) {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Your Assessment Results</h1>
        <p className="text-xl text-muted-foreground">
          Here's a summary of your fitness profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.fileText className="h-5 w-5 text-primary" />
            Assessment Summary
          </CardTitle>
          <CardDescription>
            Your responses from the fitness assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Object.entries(assessment).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {ASSESSMENT_LABELS[key]}
              </p>
              <p className="text-base font-medium capitalize">
                {value.replace(/-/g, ' ')}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        <Button 
          size="lg"
          className="w-full max-w-md"
          asChild
        >
          <Link href="/workout" className="flex items-center gap-2">
            <Icons.dumbbell className="h-5 w-5" />
            View Your Workout Plan
            <Icons.arrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Your personalized workout plan has been generated based on your assessment
        </p>
      </div>
    </div>
  )
} 