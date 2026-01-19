import React from 'react'
import { CameraShake } from '@react-three/drei'
import { useStore } from '../store'

export function IgnitionSequence() {
    const isIgniting = useStore((state) => state.isIgniting)

    return (
        <CameraShake
            maxYaw={isIgniting ? 0.02 : 0} // Shake intensity
            maxPitch={isIgniting ? 0.02 : 0}
            maxRoll={isIgniting ? 0.02 : 0}
            yawFrequency={isIgniting ? 10 : 0} // Shake speed
            pitchFrequency={isIgniting ? 10 : 0}
            rollFrequency={isIgniting ? 10 : 0}
            intensity={1}
            decay={false}
            decayRate={0.65}
        />
    )
}
