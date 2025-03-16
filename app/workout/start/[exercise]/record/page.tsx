"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Video, StopCircle, Upload, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { use } from "react"

interface PageProps {
  params: Promise<{
    exercise: string
  }>
}

// Initialize Supabase client
// // const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Felix backend URL
const FELIX_BACKEND_URL = process.env.NEXT_PUBLIC_FELIX_BACKEND_URL || "http://localhost:8000/analyze"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RecordPage({ params }: PageProps) {
  const router = useRouter()
  const { exercise } = use(params)
  const supabase = createClientComponentClient()
  
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
  const animationStartedRef = useRef<boolean>(false)
  const timeoutsRef = useRef<number[]>([])
  
  const MAX_RECORDING_TIME = 5 // 5 seconds
  
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  
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
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  // Processing animation sequence - completely rewritten for reliability
  useEffect(() => {
    // Only run when uploading or processing starts and animation hasn't started yet
    if ((isUploading || isProcessing) && !animationStartedRef.current) {
      // Mark that we've started the animation
      animationStartedRef.current = true;
      
      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
      // Define all steps and their properties
      const animationSteps = [
        { text: "Uploading video...", progress: 25, duration: 1500 },
        { text: "Analyzing " + exerciseName + " form with YOLO...", progress: 50, duration: 6000 },
        { text: "Deep Analysis...", progress: 75, duration: 2000 },
        { text: "Finalizing Result...", progress: 100, duration: null } // Last step stays until complete
      ];
      
      // Set initial step
      setProcessingStep(animationSteps[0].text);
      setProcessingProgress(animationSteps[0].progress);
      
      // Function to schedule all steps at once with absolute timing
      const scheduleAllSteps = () => {
        let cumulativeTime = 0;
        
        // Schedule each step (except the last one which has no duration)
        for (let i = 1; i < animationSteps.length; i++) {
          const step = animationSteps[i];
          const prevStep = animationSteps[i-1];
          
          // Add previous step's duration to cumulative time
          cumulativeTime += prevStep.duration || 0;
          
          // Skip steps with null duration
          if (prevStep.duration === null) continue;
          
          // Schedule this step to run after cumulative time
          const timeoutId = window.setTimeout(() => {
            if (document.visibilityState !== 'hidden') { // Only update if page is visible
              setProcessingStep(step.text);
              setProcessingProgress(step.progress);
            }
          }, cumulativeTime);
          
          // Store the timeout ID so we can clear it if needed
          timeoutsRef.current.push(timeoutId);
        }
      };
      
      // Start scheduling all steps
      scheduleAllSteps();
      
      // Log for debugging
      console.log('Animation sequence started');
    }
    
    // Reset animation flag when both uploading and processing are false
    if (!isUploading && !isProcessing) {
      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
      // Reset animation flag
      animationStartedRef.current = false;
      
      // Reset processing state
      setProcessingStep("");
      setProcessingProgress(0);
      
      // Log for debugging
      console.log('Animation sequence reset');
    }
    
    // Cleanup function
    return () => {
      // No need to clear timeouts here as we're tracking them in timeoutsRef
    };
  }, [isUploading, isProcessing, exerciseName]);

  // Get available camera devices
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)
      
      // Look for Camo or other virtual cameras
      const camoDevice = videoDevices.find(device => 
        device.label.toLowerCase().includes('camo') || 
        device.label.toLowerCase().includes('virtual')
      )
      console.log("videoDevices:", videoDevices)
      // If Camo is found, select it by default
      if (camoDevice) {
        setSelectedCamera(camoDevice.deviceId)
      } else if (videoDevices.length > 0) {
        // Otherwise select the first camera
        setSelectedCamera(videoDevices[0].deviceId)
      }
      
      return videoDevices
    } catch (error) {
      console.error("Error enumerating devices:", error)
      return []
    }
  }
  
  // Load available cameras when component mounts
  useEffect(() => {
    getAvailableCameras()
  }, [])

  const setupCamera = async () => {
    try {
      // Reset any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      // Prepare video constraints
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
      
      // If a specific camera is selected, use its deviceId
      if (selectedCamera) {
        videoConstraints.deviceId = { exact: selectedCamera }
      }
      
      // Get user media with video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
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

  // Handle camera selection change
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId)
    // If we already have the preview open, update it with the new camera
    if (videoRef.current && videoRef.current.srcObject) {
      setupCamera()
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
          // When countdown reaches 0, clear interval and start recording
          clearInterval(countdownRef.current!)
          // Don't call startRecording here, it will be called in the useEffect
          setIsCountingDown(false) // This will trigger the useEffect
          return 0
        }
        return newValue
      })
    }, 1000)
  }

  // Add useEffect to handle transition from countdown to recording
  useEffect(() => {
    // When countdown finishes (reaches 0 and isCountingDown becomes false)
    // Start recording if we just finished counting down
    if (!isCountingDown && countdownValue === 0 && !isRecording && !hasRecorded) {
      startRecording()
    }
  }, [isCountingDown, countdownValue, isRecording, hasRecorded])

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
    
    // Reset animation state before starting
    animationStartedRef.current = false;
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current = [];
    
    // Start the upload process
    setIsUploading(true);
    console.log('Starting upload process');
    
    try {
      // Generate a unique filename using timestamp and exercise name
      const timestamp = new Date().getTime()
      const filename = `${exercise}-${timestamp}.mp4`
      
      // Upload the video blob to Supabase storage
      const { error } = await supabase.storage
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
      console.log('Starting processing phase');
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
      console.log('Finishing processing');
      setIsUploading(false)
      setIsProcessing(false)
      
      // Clear any remaining timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
      // Reset animation flag
      animationStartedRef.current = false;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
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
          
          {/* Camera selection dropdown */}
          {!isRecording && !isCountingDown && !isUploading && !isProcessing && availableCameras.length > 1 && (
            <div className="mt-4">
              <label htmlFor="camera-select" className="block text-sm font-medium mb-1">
                Select Camera
              </label>
              <select
                id="camera-select"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedCamera || ''}
                onChange={(e) => handleCameraChange(e.target.value)}
              >
                {availableCameras.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${availableCameras.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
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