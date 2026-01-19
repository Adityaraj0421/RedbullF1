import React, { useEffect, useRef } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { useStore } from '../store'

export function FaceTracker() {
    const videoRef = useRef(null)
    const faceLandmarkerRef = useRef(null)
    const animationFrameRef = useRef(null)
    const setFacePosition = useStore((state) => state.setFacePosition)
    const setFaceScale = useStore((state) => state.setFaceScale)
    const setTrackingStatus = useStore((state) => state.setTrackingStatus)

    useEffect(() => {
        let isActive = true
        // Baseline inter-ocular distance (calibrated on first detection)
        let baselineEyeDistance = null

        setTrackingStatus('INITIALIZING')

        async function initializeFaceLandmarker() {
            try {
                // Initialize FilesetResolver with CDN
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
                )

                // Create FaceLandmarker with lite model for speed
                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
                    filesetResolver,
                    {
                        baseOptions: {
                            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                            delegate: 'GPU'
                        },
                        runningMode: 'VIDEO',
                        numFaces: 1,
                        minFaceDetectionConfidence: 0.5,
                        minFacePresenceConfidence: 0.5,
                        minTrackingConfidence: 0.5
                    }
                )

                // Set up webcam
                if (videoRef.current && isActive) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user', width: 640, height: 480 }
                    })
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()

                    console.log('FaceLandmarker and Webcam initialized successfully')
                    // Start detection loop
                    startDetection()
                }
            } catch (error) {
                console.error('FaceLandmarker initialization failed:', error)
                setTrackingStatus('ERROR')
            }
        }

        function startDetection() {
            let lastTime = -1
            let frameCount = 0

            console.log('[FaceTracker] Starting detection loop...')
            setTrackingStatus('ACTIVE')

            function detect() {
                if (!isActive || !videoRef.current || !faceLandmarkerRef.current) {
                    console.warn('[FaceTracker] Detection stopped - missing references')
                    return
                }

                const video = videoRef.current
                const currentTime = video.currentTime

                // Increment frame count on every animation frame
                frameCount++

                // Process every new frame for smooth tracking
                if (currentTime !== lastTime && video.readyState >= 2) {
                    lastTime = currentTime

                    try {
                        const results = faceLandmarkerRef.current.detectForVideo(video, performance.now())

                        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                            setTrackingStatus('TRACKING')
                            const landmarks = results.faceLandmarks[0]

                            // Get nose tip (landmark index 1)
                            const noseTip = landmarks[1]

                            // Normalize coordinates from [0, 1] to [-1, 1]
                            // Also mirror X because webcam is mirrored
                            const normalizedX = -((noseTip.x - 0.5) * 2)
                            const normalizedY = -((noseTip.y - 0.5) * 2)

                            setFacePosition({ x: normalizedX, y: normalizedY })

                            // Log every 60 frames (~1 second at 60fps)
                            if (frameCount % 60 === 0) {
                                console.log(`[FaceTracker] Position: x=${normalizedX.toFixed(3)}, y=${normalizedY.toFixed(3)}`)
                            }

                            // Calculate face scale using inter-ocular distance
                            // Left eye outer corner: 159, Right eye outer corner: 386
                            const leftEye = landmarks[159]
                            const rightEye = landmarks[386]
                            const eyeDistance = Math.sqrt(
                                Math.pow(rightEye.x - leftEye.x, 2) +
                                Math.pow(rightEye.y - leftEye.y, 2)
                            )

                            // Set baseline on first detection
                            if (baselineEyeDistance === null) {
                                baselineEyeDistance = eyeDistance
                                console.log('[FaceTracker] Baseline eye distance set:', eyeDistance)
                            }

                            // Calculate scale relative to baseline (closer = larger scale)
                            // Clamp between 0.7 and 1.5 for reasonable range
                            const rawScale = eyeDistance / baselineEyeDistance
                            const clampedScale = Math.max(0.7, Math.min(1.5, rawScale))
                            setFaceScale(clampedScale)
                        } else if (frameCount % 120 === 0) {
                            console.log('[FaceTracker] No face detected in frame')
                        }
                    } catch (err) {
                        console.error('[FaceTracker] Detection error:', err)
                    }
                }

                animationFrameRef.current = requestAnimationFrame(detect)
            }

            detect()
        }

        initializeFaceLandmarker()

        // Cleanup
        return () => {
            isActive = false

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }

            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks()
                tracks.forEach((track) => track.stop())
            }

            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close()
            }
        }
    }, [setFacePosition])

    return (
        <video
            ref={videoRef}
            playsInline
            muted
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -1
            }}
        />
    )
}
