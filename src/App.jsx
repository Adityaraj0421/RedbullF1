
import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

import { Stage } from './components/Stage'
import { F1Car } from './components/F1Car'
import { FaceTracker } from './components/FaceTracker'
import { GyroTracker } from './components/GyroTracker'
import { OffAxisProjection } from './components/OffAxisProjection'
import { WindowFrame } from './components/WindowFrame'
import { F1HUD } from './components/F1HUD'

import { SoundManager } from './components/SoundManager'
import { IgnitionSequence } from './components/IgnitionSequence'
import { AudioEngine } from './components/AudioEngine'

import { useStore } from './store'


function App() {
    const trackingStatus = useStore((state) => state.trackingStatus)
    const setInputMode = useStore((state) => state.setInputMode)
    const carRef = React.useRef()

    // Detect mobile devices (touch + small screen OR no mouse)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const detectMobile = () => {
            // Check for touch support AND small screen (phones/tablets)
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
            const isSmallScreen = window.innerWidth < 1024
            const hasGyro = typeof DeviceOrientationEvent !== 'undefined'

            // Mobile = touch device with small screen that has gyro
            const mobile = hasTouch && isSmallScreen && hasGyro

            setIsMobile(mobile)
            setInputMode(mobile ? 'gyro' : 'face')

            console.log(`[App] Device detection: mobile=${mobile}, touch=${hasTouch}, screen=${window.innerWidth}, gyro=${hasGyro}`)
        }

        detectMobile()
        window.addEventListener('resize', detectMobile)
        return () => window.removeEventListener('resize', detectMobile)
    }, [setInputMode])

    return (
        <>
            {/* Input Tracker - FaceTracker for desktop, GyroTracker for mobile */}
            {isMobile ? <GyroTracker /> : <FaceTracker />}

            {/* F1 HUD Layout */}
            <F1HUD />

            {/* Audio Engine */}
            <SoundManager isTracking={trackingStatus === 'ACTIVE'} />
            <AudioEngine />

            <Canvas
                shadows
                camera={{ position: [0, 0.6, 7.5], fov: 35 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true
                }}
            >
                {/* Stats for debugging */}

                <Suspense fallback={null}>
                    <Stage />
                    {/* F1Car positioned 'inside' the box (Z < 0) */}
                    <group ref={carRef} position={[0, 0, -1.5]}>
                        <F1Car />
                    </group>
                    {/* OffAxisProjection - True Fish Tank VR with asymmetric frustum */}
                    <OffAxisProjection />

                </Suspense>




                {/* WindowFrame - Static anchor for depth perception */}
                <WindowFrame />

                {/* Ignition Effect */}
                <IgnitionSequence />



                <EffectComposer>
                    {/* Basic Bloom */}
                    <Bloom
                        luminanceThreshold={0.9}
                        intensity={0.3}
                        radius={0.8}
                    />

                    {/* Basic Vignette */}
                    <Vignette
                        offset={0.1}
                        darkness={0.5}
                    />
                </EffectComposer>
            </Canvas>
        </>
    )
}

export default App

