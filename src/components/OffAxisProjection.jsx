import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { easing } from 'maath'
import { useStore } from '../store'

/**
 * OffAxisProjection - TRUE Fish Tank VR / Holographic Display Effect
 * 
 * This creates the "window into another world" effect by building an
 * ASYMMETRIC FRUSTUM based on the viewer's eye position relative to
 * the virtual screen plane.
 * 
 * Key insight: Instead of just moving the camera, we SHEAR the viewing
 * frustum so that the screen edges map exactly to the viewport edges.
 * This is what makes objects feel physically present and "grabbable".
 */
export function OffAxisProjection() {
    const { camera, gl } = useThree()
    const facePosition = useStore((state) => state.facePosition)
    const calibrationOffset = useStore((state) => state.calibrationOffset)

    // Smoothed eye position for stable movement
    const smoothedEye = useRef({ x: 0, y: 0 })

    // Mouse position fallback
    const mousePos = useRef({ x: 0, y: 0 })

    // Velocity tracking for dynamic DPR
    const lastInputPos = useRef(new Vector3())

    useEffect(() => {
        const handleMouseMove = (e) => {
            mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2
            mousePos.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // =====================================================
    // FISH TANK VR CONSTANTS
    // =====================================================

    // Virtual screen dimensions (in scene units)
    // These define the "window" you're looking through
    const SCREEN_WIDTH = 7.0   // Matches the box width (3.5 * 2)
    const SCREEN_HEIGHT = 4.0  // Matches the vertical viewing area

    // Distance from eye to virtual screen (in scene units)
    const EYE_TO_SCREEN = 7.5  // Matches the new 'Museum Camera' Z position

    // How much the eye moves in scene units per normalized face input
    const EYE_SENSITIVITY_X = 5.0
    const EYE_SENSITIVITY_Y = 1.5

    // Eye base position (centered, at base height)
    const EYE_BASE_Y = 0.6      // Matches the new 'Museum Camera' Y position

    // Near and far clipping planes
    const NEAR = 0.1
    const FAR = 100

    // Smoothing (higher = more responsive)
    const LERP = 0.3

    useFrame((state, delta) => {
        // =====================================================
        // STEP 1: Get Input (Face or Mouse)
        // =====================================================
        let inputX = 0
        let inputY = 0

        const hasFaceData = Math.abs(facePosition.x) > 0.01 || Math.abs(facePosition.y) > 0.01

        if (hasFaceData) {
            inputX = facePosition.x - calibrationOffset.x
            inputY = facePosition.y - calibrationOffset.y
        } else {
            inputX = mousePos.current.x
            inputY = mousePos.current.y
        }

        // =====================================================
        // STEP 2: Calculate Eye Position
        // =====================================================
        // The eye moves in scene units based on input
        const targetEyeX = inputX * EYE_SENSITIVITY_X
        const targetEyeY = inputY * EYE_SENSITIVITY_Y + EYE_BASE_Y

        // Smooth the eye position
        smoothedEye.current.x = MathUtils.lerp(smoothedEye.current.x, targetEyeX, LERP)
        smoothedEye.current.y = MathUtils.lerp(smoothedEye.current.y, targetEyeY, LERP)

        const eyeX = smoothedEye.current.x
        const eyeY = smoothedEye.current.y
        const eyeZ = EYE_TO_SCREEN

        // =====================================================
        // STEP 3: Position the Camera at the Eye Location
        // =====================================================
        camera.position.set(eyeX, eyeY, eyeZ)

        // =====================================================
        // STEP 4: Build Asymmetric Frustum (THE MAGIC)
        // =====================================================
        // The frustum is defined by the screen corners as seen from the eye.
        // If the eye moves right, the left edge of the screen is farther left
        // relative to the eye, and the right edge is closer.

        // Screen corners in world space (screen is at z=0 plane, centered)
        const screenLeft = -SCREEN_WIDTH / 2
        const screenRight = SCREEN_WIDTH / 2
        const screenTop = SCREEN_HEIGHT / 2 + EYE_BASE_Y
        const screenBottom = -SCREEN_HEIGHT / 2 + EYE_BASE_Y

        // Frustum bounds at the NEAR plane
        // We scale the screen bounds by (near / distance) to project onto near plane
        const nearOverDist = NEAR / eyeZ

        const left = (screenLeft - eyeX) * nearOverDist
        const right = (screenRight - eyeX) * nearOverDist
        const top = (screenTop - eyeY) * nearOverDist
        const bottom = (screenBottom - eyeY) * nearOverDist

        // =====================================================
        // STEP 5: Apply Asymmetric Projection Matrix
        // =====================================================
        camera.projectionMatrix.makePerspective(left, right, top, bottom, NEAR, FAR)
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()

        // Mark camera as needing update
        camera.matrixWorldNeedsUpdate = true

        // =====================================================
        // STEP 6: Dynamic Resolution (Velocity Based)
        // =====================================================
        // Calculate head movement speed
        const currentInputPos = new Vector3(inputX, inputY, 0)
        const speed = currentInputPos.distanceTo(lastInputPos.current) / Math.max(delta, 0.001)
        lastInputPos.current.copy(currentInputPos)

        // Target DPR: Fast movement (>0.5) -> 0.75x, Still -> 1.5x
        const targetDpr = speed > 0.5 ? 0.75 : 1.5

        // Smoothly adjust pixel ratio
        easing.damp(gl, 'pixelRatio', targetDpr, 0.3, delta)
    })

    return null
}
