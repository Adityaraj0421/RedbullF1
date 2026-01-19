import React from 'react'
import { useStore } from '../store'

/**
 * WindowFrame - SCREEN-FIXED bezel for off-axis projection depth cue
 * 
 * This frame represents the "edge of the screen" in the 3D scene.
 * It creates a strong depth cue by:
 * 1. Staying fixed relative to the camera (attached to camera group)
 * 2. Occluding objects behind it when viewer moves
 * 3. Acting as the "window glass" boundary
 * 
 * For off-axis projection, this frame should be positioned at z=0
 * relative to the camera, representing the physical screen plane.
 */
export function WindowFrame() {
    const screenConfig = useStore((state) => state.screenConfig)

    // Convert physical screen dimensions to scene units
    // We use 10cm = 1 scene unit to match OffAxisCamera
    const CM_TO_SCENE = 0.1

    // Frame dimensions match physical screen
    const windowWidth = screenConfig.width * CM_TO_SCENE  // ~3.04 units for 14" MBP
    const windowHeight = screenConfig.height * CM_TO_SCENE // ~2.12 units

    // Frame styling
    const frameThickness = 0.4   // Thick enough to be visible but not overwhelming
    const frameDepth = 0.3       // Z-depth of the frame
    const frameColor = '#000000' // Pure black for maximum contrast

    // Total frame size (window + border)
    const totalWidth = windowWidth + frameThickness * 2
    const totalHeight = windowHeight + frameThickness * 2

    // Frame positioned at the screen plane (Z=0)
    // This matches the OffAxisProjection plane where parallax is zero
    const frameZ = 0.0

    return (
        <group position={[0, 1.0, frameZ]}>
            {/* ========================================
                INNER FRAME (Window Border)
                ======================================== */}

            {/* Top Bar - Widened to cover new width */}
            <mesh position={[0, (windowHeight + frameThickness) / 2, 0]}>
                <boxGeometry args={[20, frameThickness, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Bottom Bar - Widened */}
            <mesh position={[0, -(windowHeight + frameThickness) / 2, 0]}>
                <boxGeometry args={[20, frameThickness, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Left Bar - Moved to x: -8 */}
            <mesh position={[-8, 0, 0]}>
                <boxGeometry args={[frameThickness, totalHeight, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Right Bar - Moved to x: 8 */}
            <mesh position={[8, 0, 0]}>
                <boxGeometry args={[frameThickness, totalHeight, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* ========================================
                OUTER EXTENSIONS (Cover screen edges completely)
                ======================================== */}

            {/* Extended left side - covers everything beyond window */}
            <mesh position={[-9, 0, 0]}>
                <boxGeometry args={[4, totalHeight + 8, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Extended right side */}
            <mesh position={[9, 0, 0]}>
                <boxGeometry args={[4, totalHeight + 8, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Extended top */}
            <mesh position={[0, windowHeight + 2, 0]}>
                <boxGeometry args={[20, 4, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>

            {/* Extended bottom */}
            <mesh position={[0, -windowHeight - 2, 0]}>
                <boxGeometry args={[20, 4, frameDepth]} />
                <meshBasicMaterial color={frameColor} />
            </mesh>
        </group>
    )
}
