"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface AssessmentResultsProps {
  assessment: Record<string, string>
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

export function AssessmentResults({ assessment }: AssessmentResultsProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Image with Gradient Overlay - same as landing page */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/bg-pattern.jpg"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-white/60" />
      </div>

      <div className="container max-w-4xl py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black">Your Assessment Results</h1>
          <p className="text-xl text-gray-600">
            Here&apos;s a summary of your fitness profile
          </p>
        </div>

        <Card className="bg-white/80 border border-gray-200 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Icons.fileText className="h-5 w-5 text-[#F26430]" />
              Assessment Summary
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your responses from the fitness assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Object.entries(assessment).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {ASSESSMENT_LABELS[key]}
                </p>
                <p className="text-base font-medium capitalize text-black">
                  {value.replace(/-/g, ' ')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg"
            className="w-full max-w-md bg-[#F26430] hover:bg-[#F26430]/90 text-white py-6 text-lg rounded-xl"
            asChild
          >
            <Link href="/workout" className="flex items-center gap-2">
              <Icons.dumbbell className="h-5 w-5" />
              View Your Workout Plan
              <Icons.arrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-600">
            Your personalized workout plan has been generated based on your assessment
          </p>
        </div>
      </div>
    </div>
  )
} 