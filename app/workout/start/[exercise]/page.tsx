import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, ChevronRight } from "lucide-react"
import Link from "next/link"

interface ExerciseStartPageProps {
  params: {
    exercise: string
  }
}

export default function ExerciseStartPage({ params }: ExerciseStartPageProps) {
  // Format the exercise name for display (convert from URL format)
  const exerciseName = params.exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <Card className="border-[#F26430]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#F26430]/10 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-[#F26430]" />
            </div>
          </div>
          <CardTitle className="text-3xl text-center">
            {exerciseName}
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Hello, welcome to the {exerciseName} exercise demonstration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            Click next to see our video.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            size="lg" 
            className="w-full bg-[#F26430] hover:bg-[#F26430]/90 flex items-center justify-center gap-2"
            asChild
          >
            <Link href={`/workout/start/${params.exercise}/video`}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/workout">
              Back to Workout Plan
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 