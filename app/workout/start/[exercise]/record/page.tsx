"use client"

import { useState, useRef, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Video, StopCircle, Upload, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface RecordPageProps {
  params: Promise<{
    exercise: string
  }>
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Felix backend URL
const FELIX_BACKEND_URL = "http://ec2-3-87-161-127.compute-1.amazonaws.com/analyze"

export default function RecordPage({ params }: RecordPageProps) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const { exercise } = unwrappedParams
  
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>("")
  const [processingProgress, setProcessingProgress] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const MAX_RECORDING_TIME = 5 // 5 seconds
  
  // Format the exercise name for display (convert from URL format)
  const exerciseName = exercise
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  useEffect(() => {
    // Clean up function to stop all media when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  // Processing animation sequence
  useEffect(() => {
    if (isUploading || isProcessing) {
      const steps = [
        "Uploading video...",
        "Analyzing " + exerciseName + " form with YOLO...",
        "Deep Analysis...",
        "Finalizing Result..."
      ]
      
      let currentStepIndex = 0
      setProcessingStep(steps[currentStepIndex])
      setProcessingProgress(25)
      
      processingTimerRef.current = setInterval(() => {
        currentStepIndex = (currentStepIndex + 1) % steps.length
        setProcessingStep(steps[currentStepIndex])
        setProcessingProgress((currentStepIndex + 1) * 25)
      }, 2000) // Change step every 2 seconds
      
      return () => {
        if (processingTimerRef.current) {
          clearInterval(processingTimerRef.current)
        }
      }
    }
  }, [isUploading, isProcessing, exerciseName])

  const setupCamera = async () => {
    try {
      // Reset any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      // Get user media with video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      streamRef.current = stream
      
      // Set the stream as the source for the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      return true
    } catch (error) {
      console.error("Error accessing camera:", error)
      return false
    }
  }

  const startCountdown = async () => {
    const cameraReady = await setupCamera()
    
    if (!cameraReady) {
      toast.error("Could not access camera. Please check permissions and try again.")
      return
    }
    
    setIsCountingDown(true)
    setCountdownValue(5)
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdownValue((prev) => {
        const newValue = prev - 1
        if (newValue <= 0) {
          // When countdown reaches 0, start recording
          clearInterval(countdownRef.current!)
          startRecording()
          return 0
        }
        return newValue
      })
    }, 1000)
  }

  const startRecording = async () => {
    setIsCountingDown(false)
    
    // Reset recording state
    setRecordingTime(0)
    chunksRef.current = []
    
    // Create media recorder from stream
    if (streamRef.current) {
      // Use MP4 compatible options for MediaRecorder
      const options = { mimeType: 'video/mp4; codecs=h264' }
      
      // Fallback to available format if MP4 is not supported
      let mediaRecorder: MediaRecorder
      
      try {
        mediaRecorder = new MediaRecorder(streamRef.current, options)
      } catch (e) {
        console.warn('MP4 recording not supported, falling back to default format', e)
        mediaRecorder = new MediaRecorder(streamRef.current)
      }
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        // Create blob with MP4 mime type
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' })
        setVideoBlob(blob)
        
        // Create URL for the recorded video
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        
        // Update video element to play the recording
        if (videoRef.current) {
          videoRef.current.srcObject = null
          videoRef.current.src = url
          videoRef.current.controls = true
        }
      }
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      
      // Set up timer to track recording progress
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1
          
          // Auto-stop recording after MAX_RECORDING_TIME seconds
          if (newTime >= MAX_RECORDING_TIME && mediaRecorderRef.current?.state === "recording") {
            stopRecording()
          }
          
          return newTime
        })
      }, 100)
    }
  }

  const stopRecording = () => {
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    setHasRecorded(true)
  }

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setIsCountingDown(false)
    
    // Stop camera if we're not going to use it
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const retakeRecording = () => {
    // Clean up previous recording
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
      setVideoUrl(null)
    }
    setVideoBlob(null)
    setHasRecorded(false)
    setRecordingTime(0)
    
    // Start countdown for new recording
    startCountdown()
  }

  const submitRecording = async () => {
    if (!videoBlob) {
      toast.error("No recording found to upload")
      return
    }
    
    setIsUploading(true)
    setProcessingStep("Uploading video...")
    setProcessingProgress(25)
    
    try {
      // Generate a unique filename using timestamp and exercise name
      const timestamp = new Date().getTime()
      const filename = `${exercise}-${timestamp}.mp4`
      
      // Upload the video blob to Supabase storage
      const { data, error } = await supabase.storage
        .from('exercise-demo')
        .upload(filename, videoBlob, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        })
      
      if (error) {
        throw error
      }
      
      // Get the public URL of the uploaded video
      const { data: urlData } = supabase.storage
        .from('exercise-demo')
        .getPublicUrl(filename)
      
      const videoPublicUrl = urlData.publicUrl
      console.log("Video uploaded successfully:", videoPublicUrl)
      
      // Now call the Felix backend with the video URL
      setIsProcessing(true)
      setIsUploading(false)
      
      // Construct the URL with the video_url query parameter
      const felixUrl = new URL(FELIX_BACKEND_URL)
      felixUrl.searchParams.append('video_url', videoPublicUrl)
      
      // Call the Felix backend
      const response = await fetch(felixUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Felix API responded with status: ${response.status}`)
      }
      
      const analysisData = await response.json()
      console.log("Analysis completed:", analysisData)
      
      toast.success("Your recording has been analyzed successfully!")
      
      // Extract relevant data from the analysis response
      const {
        image_url,
        summary,
        audio_url,
        min_knee_angle,
        risk_factor,
        improvements
      } = analysisData
      
      // Construct the URL with query parameters for the results page
      const resultsUrl = new URL(`/workout/start/${exercise}/results`, window.location.origin)
      
      // Add all the analysis data as query parameters
      if (image_url) resultsUrl.searchParams.append('image_url', encodeURIComponent(image_url))
      if (summary) resultsUrl.searchParams.append('summary', encodeURIComponent(summary))
      if (audio_url) resultsUrl.searchParams.append('audio_url', encodeURIComponent(audio_url))
      if (min_knee_angle !== undefined) resultsUrl.searchParams.append('min_knee_angle', min_knee_angle.toString())
      if (risk_factor) resultsUrl.searchParams.append('risk_factor', risk_factor)
      if (improvements) resultsUrl.searchParams.append('improvements', encodeURIComponent(improvements))
      
      // Navigate to the results page
      router.push(resultsUrl.pathname + resultsUrl.search)
      
    } catch (error) {
      console.error("Error processing video:", error)
      toast.error("Failed to process video. Please try again.")
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
      }
    }
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <Card className="border-[#F26430]/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            Record Your {exerciseName}
          </CardTitle>
          {isRecording && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Recording</span>
                <span>{recordingTime.toFixed(1)}s / {MAX_RECORDING_TIME}s</span>
              </div>
              <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-2" />
            </div>
          )}
          {(isUploading || isProcessing) && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{processingStep}</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              autoPlay 
              playsInline 
              muted={isRecording || isCountingDown} // Mute during recording and countdown
            />
            
            {!isRecording && !hasRecorded && !isCountingDown && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Video className="w-16 h-16 text-white mx-auto" />
                <p className="text-white mt-4">Press the button below to start recording</p>
              </div>
            )}
            
            {isCountingDown && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <div className="text-8xl font-bold text-white animate-pulse">
                  {countdownValue}
                </div>
                <p className="text-white mt-4">Get ready...</p>
              </div>
            )}
            
            {isRecording && (
              <div className="absolute top-4 right-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
            
            {(isUploading || isProcessing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-white text-xl font-medium mb-2">{processingStep}</p>
                <div className="w-64 bg-gray-700 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-[#F26430] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-white/70 text-sm">Please wait while we analyze your exercise...</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <p className="text-center text-muted-foreground">
              {!hasRecorded && !isCountingDown
                ? "Record yourself performing the exercise (max 5 seconds)." 
                : isCountingDown
                ? "Countdown before recording starts..."
                : "Great job! You can submit your recording or record again."}
            </p>
            {hasRecorded && !isUploading && !isProcessing && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                Your video will be analyzed to provide feedback on your form.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            asChild={!isCountingDown} 
            onClick={isCountingDown ? cancelCountdown : undefined}
            disabled={isUploading || isProcessing}
          >
            {!isCountingDown ? (
              <Link href={`/workout/start/${exercise}/video`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Video
              </Link>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </>
            )}
          </Button>
          
          {!isRecording && !hasRecorded && !isCountingDown ? (
            <Button 
              onClick={startCountdown}
              className="bg-[#F26430] hover:bg-[#F26430]/90 flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Start Recording
            </Button>
          ) : isCountingDown ? (
            <Button 
              onClick={cancelCountdown}
              variant="outline"
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
          ) : isRecording ? (
            <Button 
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Recording
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={retakeRecording}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isUploading || isProcessing}
              >
                <RefreshCw className="h-4 w-4" />
                Retake
              </Button>
              <Button 
                onClick={submitRecording}
                className="bg-[#F26430] hover:bg-[#F26430]/90 flex items-center gap-2"
                disabled={isUploading || isProcessing}
              >
                {isUploading || isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 