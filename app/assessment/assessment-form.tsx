"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: string
  title: string
  options: {
    icon?: string
    label: string
    value: string
  }[]
}

const questions: Question[] = [
  {
    id: "primary-goal",
    title: "What's your primary goal?",
    options: [
      { icon: "🔥", label: "Lose Weight", value: "lose-weight" },
      { icon: "🧘", label: "Improve Flexibility", value: "flexibility" },
      { icon: "💪", label: "Tone Booty and Abs", value: "tone" },
      { icon: "💪", label: "Increase Muscle Strength", value: "strength" },
    ],
  },
  {
    id: "gender",
    title: "What's your gender?",
    options: [
      { icon: "👨", label: "Male", value: "male" },
      { icon: "👩", label: "Female", value: "female" },
      { icon: "🌈", label: "Other", value: "other" },
    ],
  },
  {
    id: "age",
    title: "What's your age?",
    options: [
      { label: "Under 20", value: "under-20" },
      { label: "20-29", value: "20-29" },
      { label: "30-39", value: "30-39" },
      { label: "40-49", value: "40-49" },
      { label: "50+", value: "50-plus" },
    ],
  },
  {
    id: "fitness-level",
    title: "What's your current fitness level?",
    options: [
      { icon: "🌱", label: "Beginner", value: "beginner" },
      { icon: "🌿", label: "Intermediate", value: "intermediate" },
      { icon: "🌳", label: "Advanced", value: "advanced" },
    ],
  },
  {
    id: "training-access",
    title: "Where will you train?",
    options: [
      { icon: "🏋️", label: "Gym", value: "gym" },
      { icon: "🏠", label: "Home (Bodyweight)", value: "bodyweight" },
      { icon: "🔄", label: "Both", value: "both" },
    ],
  },
  {
    id: "frequency",
    title: "How often can you exercise?",
    options: [
      { label: "1-2 days/week", value: "1-2" },
      { label: "3-4 days/week", value: "3-4" },
      { label: "5-6 days/week", value: "5-6" },
      { label: "Every day", value: "7" },
    ],
  },
  {
    id: "diet",
    title: "What's your diet preference?",
    options: [
      { icon: "🍽️", label: "No Restrictions", value: "no-restrictions" },
      { icon: "🥗", label: "Vegetarian", value: "vegetarian" },
      { icon: "🌱", label: "Vegan", value: "vegan" },
      { icon: "🥑", label: "Keto", value: "keto" },
      { icon: "🍖", label: "Paleo", value: "paleo" },
    ],
  },
]

export function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Handle form completion
      console.log(answers)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="rounded-none bg-neutral-800" />
      </div>

      {/* Back button - Fixed position */}
      <AnimatePresence>
        {currentStep > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleBack}
            className="fixed top-8 left-8 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h1 className="text-4xl font-bold text-center mb-12">
                {currentQuestion.title}
              </h1>

              {/* Options */}
              <div className="grid gap-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full p-6 h-auto flex items-center text-left text-white hover:bg-white/10 border-neutral-800 hover:border-neutral-700 transition-colors"
                      onClick={() => handleOptionSelect(option.value)}
                    >
                      {option.icon && (
                        <span className="text-2xl mr-4">{option.icon}</span>
                      )}
                      <span className="text-lg">{option.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Step indicator */}
              <motion.div 
                className="text-center text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStep + 1}/{questions.length}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 