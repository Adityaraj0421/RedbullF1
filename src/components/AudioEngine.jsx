import { useRef, useEffect } from "react";
import { useStore } from '../store';

export function AudioEngine() {
    const isIgniting = useStore((state) => state.isIgniting);
    const stopIgnition = useStore((state) => state.stopIgnition);
    const ignitionSound = useRef(null);

    useEffect(() => {
        // Initialize audio object once
        ignitionSound.current = new Audio("/f1_ignition.mp3");

        // 1. Preload the sound so there is NO DELAY when clicked
        ignitionSound.current.preload = "auto";
        ignitionSound.current.volume = 0.5;

        // Sync state: Stop igniting when sound finishes
        ignitionSound.current.onended = () => {
            stopIgnition();
        };

        // Cleanup
        return () => {
            if (ignitionSound.current) {
                ignitionSound.current.pause();
                ignitionSound.current = null;
            }
        }
    }, []);

    useEffect(() => {
        if (isIgniting && ignitionSound.current) {
            // 2. Play Sound immediately when 'isIgniting' state is true
            ignitionSound.current.currentTime = 0; // Reset to start
            ignitionSound.current.play().catch(e => console.log("Audio blocked", e));
        }
    }, [isIgniting]);

    return null; // No UI, just logic
}
