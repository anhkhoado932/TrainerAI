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

export default function VideoPage({ params }: VideoPageProps) {
  // Format the exercise name for display (convert from URL format)
  const exerciseName = params.exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Use a reliable video ID for demonstration purposes
  // This is a generic exercise video that should be available
  const videoId = "UBMk30rjy0o"

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <Card className="border-green-500/20">
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
            <Link href={`/workout/start/${params.exercise}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button className="bg-green-500 hover:bg-green-600 flex items-center gap-2" asChild>
            <Link href={`/workout/start/${params.exercise}/record`}>
              <Video className="h-4 w-4" />
              Record Your Demo
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 