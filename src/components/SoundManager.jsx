import { useEffect, useRef } from "react";
import { useStore } from '../store';

export function SoundManager({ isTracking }) {
    const isIgniting = useStore((state) => state.isIgniting);
    const audioContext = useRef(null);
    const droneNode = useRef(null);
    const humNode = useRef(null);
    const gainNode = useRef(null);

    useEffect(() => {
        // 1. Initialize Audio Context (Must happen after user interaction usually, 
        // but we prepare it here)
        const initAudio = () => {
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)();

                // Master Gain (Volume Control)
                gainNode.current = audioContext.current.createGain();
                gainNode.current.gain.value = 0.15; // Keep it subtle (15% volume)
                gainNode.current.connect(audioContext.current.destination);

                // --- LAYER 1: THE RUSTY ROOM (Brown Noise) ---
                const bufferSize = 2 * audioContext.current.sampleRate;
                const noiseBuffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
                const output = noiseBuffer.getChannelData(0);

                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02; // Simple Brown Noise filter
                    lastOut = output[i];
                    output[i] *= 3.5;
                }

                droneNode.current = audioContext.current.createBufferSource();
                droneNode.current.buffer = noiseBuffer;
                droneNode.current.loop = true;
                droneNode.current.connect(gainNode.current);
                droneNode.current.start();

                // --- LAYER 2: THE SCANNER (Sine Wave) ---
                // This represents the tracking camera "working"
                humNode.current = audioContext.current.createOscillator();
                humNode.current.type = "sine";
                humNode.current.frequency.value = 80; // Low hum
                const humGain = audioContext.current.createGain();
                humGain.gain.value = 0; // Start silent
                humNode.current.connect(humGain);
                humGain.connect(audioContext.current.destination);
                humNode.current.vol = humGain; // Store ref to control volume later
                humNode.current.start();
            }
        };

        // Browsers block audio until first click. 
        // We attach a one-time listener to the window to start the engine.
        const startEngine = () => {
            initAudio();
            if (audioContext.current?.state === "suspended") {
                audioContext.current.resume();
            }
            window.removeEventListener("click", startEngine);
            window.removeEventListener("keydown", startEngine);
        };

        window.addEventListener("click", startEngine);
        window.addEventListener("keydown", startEngine);

        return () => {
            audioContext.current?.close();
        };
    }, []);

    // 2. React to Tracking State
    useEffect(() => {
        if (humNode.current?.vol) {
            if (isTracking) {
                // RAMP UP: When tracking locks, pitch goes up slightly and volume comes in
                // This sounds like a machine "powering up"
                humNode.current.frequency.setTargetAtTime(120, audioContext.current.currentTime, 0.5);
                humNode.current.vol.gain.setTargetAtTime(0.05, audioContext.current.currentTime, 0.5);
            } else {
                // RAMP DOWN: Fade out when tracking is lost
                humNode.current.frequency.setTargetAtTime(80, audioContext.current.currentTime, 0.5);
                humNode.current.vol.gain.setTargetAtTime(0, audioContext.current.currentTime, 0.5);
            }
        }
    }, [isTracking]);

    // 3. Ducking Logic (Ignition)
    useEffect(() => {
        if (gainNode.current && audioContext.current) {
            const currentTime = audioContext.current.currentTime;
            if (isIgniting) {
                // DUCK: Fast fade out to silence/near-silence
                gainNode.current.gain.cancelScheduledValues(currentTime);
                gainNode.current.gain.setTargetAtTime(0.0, currentTime, 0.1);
            } else {
                // RESTORE: Slow fade back in to ambient level
                gainNode.current.gain.cancelScheduledValues(currentTime);
                gainNode.current.gain.setTargetAtTime(0.15, currentTime, 1.0);
            }
        }
    }, [isIgniting]);

    return null; // This component has no UI
}
