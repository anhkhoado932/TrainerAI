import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const assessment = await prisma.assessment.create({
      data: {
        primaryGoal: data['primary-goal'],
        gender: data.gender,
        age: data.age,
        fitnessLevel: data['fitness-level'],
        trainingAccess: data['training-access'],
        frequency: data.frequency,
        diet: data.diet,
      },
    })

    return NextResponse.json({ assessmentId: assessment.id })
  } catch (error) {
    console.error('Error saving assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    )
  }
} 