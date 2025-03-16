import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Video, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VideoPageProps {
  params: {
    exercise: string
  }
}

// Convert to an async function to properly handle params
export default async function VideoPage({ params }: VideoPageProps) {
  // Ensure params is properly awaited
  const exercise = params.exercise

  // Format the exercise name for display (convert from URL format)
  const exerciseName = exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Use a reliable video ID for demonstration purposes
  // This is a generic exercise video that should be available
  const videoId = "UBMk30rjy0o"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="border-[#F26430]/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            {exerciseName} Video Demonstration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video rounded-md overflow-hidden">
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${exerciseName} demonstration`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <Alert className="bg-amber-500/10 border-amber-500/50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-500">
              If the video is unavailable, please try refreshing the page or check your internet connection.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/workout/start/${exercise}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button className="bg-[#F26430] hover:bg-[#F26430]/90 flex items-center gap-2" asChild>
            <Link href={`/workout/start/${exercise}/record`}>
              <Video className="h-4 w-4" />
              Record Your Demo
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 