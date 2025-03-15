"use client"

import { useState, useEffect, use, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, Info, Award, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResultsPageProps {
  params: Promise<{
    exercise: string
  }>
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const unwrappedParams = use(params)
  const { exercise } = unwrappedParams
  const searchParams = useSearchParams()
  
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Format the exercise name for display (convert from URL format)
  const exerciseName = exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  useEffect(() => {
    // Get the analysis data from URL parameters
    const imageUrl = searchParams.get('image_url')
    const summary = searchParams.get('summary')
    const audioUrl = searchParams.get('audio_url')
    const minKneeAngle = searchParams.get('min_knee_angle')
    const riskFactor = searchParams.get('risk_factor')
    const improvements = searchParams.get('improvements')
    
    if (imageUrl) {
      setAnalysisData({
        image_url: decodeURIComponent(imageUrl),
        summary: summary ? decodeURIComponent(summary) : "Analysis complete",
        audio_url: audioUrl ? decodeURIComponent(audioUrl) : null,
        min_knee_angle: minKneeAngle || "0",
        risk_factor: riskFactor || "Low",
        improvements: improvements ? decodeURIComponent(improvements) : "No specific improvements needed"
      })
      setLoading(false)
    } else {
      setError("No analysis data found. Please try recording again.")
      setLoading(false)
    }
  }, [searchParams])

  // Auto-play audio when analysis data is loaded
  useEffect(() => {
    if (analysisData?.audio_url && audioRef.current) {
      // Small delay to ensure the audio element is fully initialized
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsAudioPlaying(true)
            })
            .catch(err => {
              console.error("Error auto-playing audio:", err)
              // Auto-play might be blocked by browser policy
            })
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [analysisData])

  // Handle audio play/pause toggle
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
        setIsAudioPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => {
            setIsAudioPlaying(true)
          })
          .catch(err => {
            console.error("Error playing audio:", err)
          })
      }
    }
  }

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsAudioPlaying(false)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 space-y-8">
        <Card className="border-[#F26430]/20">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26430] mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10 space-y-8">
        <Card className="border-[#F26430]/20">
          <CardContent className="py-10">
            <Alert variant="destructive" className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/workout/start/${exercise}`}>
                  Try Again
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <Card className="border-[#F26430]/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {exerciseName} Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Image */}
          <div className="rounded-md overflow-hidden bg-muted relative aspect-video">
            {analysisData?.image_url ? (
              <Image 
                src={analysisData.image_url} 
                alt="Exercise Analysis" 
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No analysis image available</p>
              </div>
            )}
          </div>
          
          {/* Summary */}
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              Analysis Summary
            </h3>
            <p className="text-muted-foreground">{analysisData?.summary}</p>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-1">Knee Angle</h4>
              <p className="text-2xl font-bold">{parseFloat(analysisData?.min_knee_angle).toFixed(2)}°</p>
              <p className="text-sm text-muted-foreground mt-1">Minimum angle detected during exercise</p>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-1">Risk Assessment</h4>
              <p className="text-muted-foreground">
                {analysisData?.risk_factor.replace(/^:\s*/, '').split(' - ').map((risk: string, index: number) => {
                  if (index === 0) {
                    return <p key={index}>{risk.trim()}</p>;
                  }
                  return risk.trim() ? (
                    <p key={index} className="mt-1">• {risk.trim()}</p>
                  ) : null;
                })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Based on form analysis</p>
            </div>
          </div>
          
          {/* Improvements */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Suggested Improvements</h4>
            <div className="text-muted-foreground">
              {analysisData?.improvements.replace(/^:\s*/, '').split(' - ').map((improvement: string, index: number) => {
                if (index === 0) {
                  return <p key={index}>{improvement.trim()}</p>;
                }
                return improvement.trim() ? (
                  <p key={index} className="mt-1">• {improvement.trim()}</p>
                ) : null;
              })}
            </div>
          </div>
          
          {/* Audio Playback if available - hidden but functional */}
          {analysisData?.audio_url && (
            <>
              <audio 
                ref={audioRef}
                src={analysisData.audio_url} 
                onEnded={handleAudioEnded}
                className="hidden" // Hide the audio element
              />
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Audio Feedback</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleAudio}
                    className="flex items-center gap-2"
                  >
                    {isAudioPlaying ? (
                      <>
                        <VolumeX className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/workout/start/${exercise}/record`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Record Again
            </Link>
          </Button>
          <Button 
            className="bg-[#F26430] hover:bg-[#F26430]/90"
            asChild
          >
            <Link href={`/workout/start/${exercise}/tracking`}>
              Continue Workout
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 