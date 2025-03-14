"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"
import OpenAI from 'openai'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  title: string
  options: {
    icon?: string
    label: string
    value: string
  }[]
}

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

const GENERATION_STEPS = [
  { id: 1, text: "Analyzing your profile..." },
  { id: 2, text: "Curating personalized workout plan..." },
  { id: 3, text: "Adjusting to your schedule..." },
  { id: 4, text: "Starting your fitness journey..." },
]

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === GENERATION_STEPS.length - 1) {
          clearInterval(stepInterval)
          setTimeout(() => {
            setIsFinishing(true)
            setTimeout(onComplete, 1000) // Wait for fade out animation
          }, 1000)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(stepInterval)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-8"
    >
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {GENERATION_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: index === currentStep ? 1 : index < currentStep ? 0.5 : 0.3,
                y: 0 
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center space-x-3"
            >
              <motion.div 
                className={`w-2 h-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-green-500' 
                    : index < currentStep 
                    ? 'bg-green-700' 
                    : 'bg-neutral-600'
                }`}
                animate={{
                  scale: index === currentStep ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
              />
              <span className={
                index === currentStep 
                  ? 'text-white' 
                  : index < currentStep 
                  ? 'text-neutral-400' 
                  : 'text-neutral-600'
              }>
                {step.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.div 
        className="flex justify-center"
        animate={{ opacity: isFinishing ? 0 : 1 }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </motion.div>
    </motion.div>
  )
}

export function AssessmentForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleOptionSelect = async (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const generateWorkoutPlan = async (assessment: Record<string, string>): Promise<WorkoutPlan> => {
    const prompt = `Generate a personalized workout and nutrition plan based on the following assessment:
    ${JSON.stringify(assessment, null, 2)}
    
    Respond with a JSON object in this exact format:
    {
      "overview": "Brief overview of the plan",
      "weeklySchedule": {
        "day1": {
          "exercises": [
            {
              "name": "Exercise name",
              "sets": number,
              "reps": "number or range (e.g., '8-12')",
              "rest": "rest period (e.g., '60s')",
              "notes": "optional form tips"
            }
          ],
          "cardio": {
            "type": "cardio type",
            "duration": "duration in minutes",
            "intensity": "low/moderate/high"
          }
        }
        // ... repeat for other days
      }
    }`

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness trainer and nutritionist. Generate detailed, safe, and effective workout plans."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')
    return JSON.parse(content) as WorkoutPlan
  }

  const handleSaveAssessment = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Generate workout plan
      const workoutPlan = await generateWorkoutPlan(answers)

      const { error } = await supabase
        .from('user_data')
        .insert({ 
          user_id_fk: user.id,
          assessment: answers,
          workout_plan: workoutPlan
        })
        .select()

      if (error) throw error
      
      toast.success('Assessment saved successfully!', {
        description: 'Your personalized workout plan has been generated.'
      })
    } catch (error) {
      console.error('Error saving assessment:', error)
      toast.error('Failed to save assessment', {
        description: 'Please try again later.'
      })
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    router.push('/workout')
  }

  const handleBack = () => {
    if (isCompleted) {
      setIsCompleted(false)
    } else if (currentStep > 0) {
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
        {(currentStep > 0 || isCompleted) && (
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
            {!isCompleted ? (
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 text-center"
              >
                {isLoading ? (
                  <LoadingScreen onComplete={handleComplete} />
                ) : (
                  <>
                    <h2 className="text-4xl font-bold">Assessment Complete!</h2>
                    <p className="text-neutral-400">
                      Ready to get your personalized workout plan?
                    </p>
                    <Button
                      size="lg"
                      className="w-full py-8 text-lg"
                      onClick={handleSaveAssessment}
                      disabled={isLoading}
                    >
                      Save & Continue
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          {!isCompleted && (
            <motion.div 
              className="text-center text-sm text-neutral-500 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentStep + 1}/{questions.length}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 