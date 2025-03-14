import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { assessmentId } = await req.json()

    // Get assessment data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Generate prompt for OpenAI
    const prompt = `Create a personalized workout plan based on the following assessment:
    - Primary Goal: ${assessment.primaryGoal}
    - Gender: ${assessment.gender}
    - Age: ${assessment.age}
    - Fitness Level: ${assessment.fitnessLevel}
    - Training Access: ${assessment.trainingAccess}
    - Frequency: ${assessment.frequency}
    - Diet: ${assessment.diet}

    Please provide a structured workout plan with specific exercises, sets, reps, and progression guidelines.`

    // Get AI recommendations
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    })

    const workoutPlan = completion.choices[0].message.content

    // Save workout plan to database
    await prisma.workoutPlan.create({
      data: {
        assessmentId,
        plan: workoutPlan,
      },
    })

    return NextResponse.json({ workoutPlan })
  } catch (error) {
    console.error('Error analyzing assessment:', error)
    return NextResponse.json(
      { error: 'Failed to analyze assessment' },
      { status: 500 }
    )
  }
} 