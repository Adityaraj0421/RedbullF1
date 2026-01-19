import { useEffect, useRef } from 'react'
import { useStore } from '../store'

/**
 * GyroTracker - Mobile Device Orientation Input
 * 
 * Replaces FaceTracker on mobile devices, using phone tilt as input
 * for the parallax effect. Creates a "Magic Window" experience.
 * 
 * Mapping:
 * - Tilt phone LEFT  → see RIGHT side of car (like a real window)
 * - Tilt phone UP    → see BOTTOM of car
 */
export function GyroTracker() {
    const setFacePosition = useStore((state) => state.setFacePosition)
    const setTrackingStatus = useStore((state) => state.setTrackingStatus)
    const calibrate = useStore((state) => state.calibrate)

    // Calibration offset for neutral phone position
    const calibrationRef = useRef({ beta: 45, gamma: 0 })
    const isCalibrated = useRef(false)
    const permissionGranted = useRef(false)

    useEffect(() => {
        let isActive = true
        setTrackingStatus('INITIALIZING')

        // Smoothing values
        let smoothX = 0
        let smoothY = 0
        const SMOOTHING = 0.15

        function handleOrientation(event) {
            if (!isActive) return

            // gamma: left/right tilt (-90 to 90)
            // beta: front/back tilt (-180 to 180), ~45° is natural holding angle
            const { beta, gamma } = event

            if (beta === null || gamma === null) {
                setTrackingStatus('UNAVAILABLE')
                return
            }

            // Set initial calibration on first valid reading
            if (!isCalibrated.current) {
                calibrationRef.current = { beta: beta, gamma: gamma }
                isCalibrated.current = true
                console.log('[GyroTracker] Calibrated at:', calibrationRef.current)
            }

            setTrackingStatus('TRACKING')

            // Apply calibration offset
            const calibratedBeta = beta - calibrationRef.current.beta
            const calibratedGamma = gamma - calibrationRef.current.gamma

            // Map to normalized -1 to 1 range
            // ±30° of tilt = full range
            const TILT_RANGE = 30

            const rawX = Math.max(-1, Math.min(1, calibratedGamma / TILT_RANGE))
            const rawY = Math.max(-1, Math.min(1, calibratedBeta / TILT_RANGE))

            // Apply smoothing (lerp)
            smoothX += (rawX - smoothX) * SMOOTHING
            smoothY += (rawY - smoothY) * SMOOTHING

            // Update store (same format as FaceTracker)
            setFacePosition({ x: smoothX, y: smoothY })
        }

        async function requestPermissionAndStart() {
            try {
                // iOS 13+ requires explicit permission request
                if (typeof DeviceOrientationEvent !== 'undefined' &&
                    typeof DeviceOrientationEvent.requestPermission === 'function') {

                    console.log('[GyroTracker] Requesting iOS permission...')
                    const permission = await DeviceOrientationEvent.requestPermission()

                    if (permission !== 'granted') {
                        console.warn('[GyroTracker] Permission denied')
                        setTrackingStatus('PERMISSION_DENIED')
                        return
                    }

                    permissionGranted.current = true
                    console.log('[GyroTracker] iOS permission granted')
                }

                // Check if DeviceOrientationEvent is supported
                if (typeof DeviceOrientationEvent === 'undefined') {
                    console.warn('[GyroTracker] DeviceOrientation not supported')
                    setTrackingStatus('UNSUPPORTED')
                    return
                }

                // Start listening
                window.addEventListener('deviceorientation', handleOrientation, true)
                console.log('[GyroTracker] Listening for device orientation')
                setTrackingStatus('ACTIVE')

            } catch (error) {
                console.error('[GyroTracker] Error:', error)
                setTrackingStatus('ERROR')
            }
        }

        requestPermissionAndStart()

        // Cleanup
        return () => {
            isActive = false
            window.removeEventListener('deviceorientation', handleOrientation, true)
        }
    }, [setFacePosition, setTrackingStatus])

    // Listen for calibration requests from the HUD
    useEffect(() => {
        const handleCalibrate = () => {
            isCalibrated.current = false
            console.log('[GyroTracker] Calibration reset - next reading will be new center')
        }

        // Re-export calibration to store when triggered
        const unsubscribe = useStore.subscribe(
            (state) => state.isCalibrated,
            (isCalibrated) => {
                if (isCalibrated) {
                    // Reset our internal calibration flag so next reading sets new center
                    handleCalibrate()
                }
            }
        )

        return unsubscribe
    }, [])

    // No visual output - runs in background
    return null
}
