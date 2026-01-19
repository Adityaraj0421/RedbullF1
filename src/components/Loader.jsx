import React, { useState, useEffect } from 'react';
import { useProgress } from "@react-three/drei";

export function Loader() {
    const { active, progress, errors, item, loaded, total } = useProgress();
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // When progress reaches 100% and loading is no longer active
        if (progress === 100 && !active) {
            // Add a small delay to ensure everything is rendered
            const timer = setTimeout(() => {
                setIsComplete(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [progress, active]);

    // Log loading progress for debugging
    useEffect(() => {
        if (item) {
            console.log(`[Loader] Loading: ${item} (${loaded}/${total}) - ${Math.round(progress)}%`);
        }
    }, [item, loaded, total, progress]);

    return (
        <div style={styles.container(isComplete)}>
            <div style={styles.content}>
                <img
                    src="/d624c2628a113722e7d869d7bacd000d-removebg-preview.png"
                    alt="Red Bull Racing Logo"
                    style={styles.logoImage}
                />
                <div style={styles.barContainer}>
                    <div style={styles.bar(progress)} />
                </div>
                <div style={styles.data}>
                    LOADING ASSETS... {Math.round(progress)}%
                </div>
                {errors.length > 0 && (
                    <div style={styles.error}>
                        Error loading assets
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: (finished) => ({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#223971", // Red Bull Blue
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        opacity: finished ? 0 : 1,
        pointerEvents: finished ? "none" : "auto",
        transition: "opacity 0.5s ease",
    }),
    content: {
        width: "300px",
        fontFamily: "'JetBrains Mono', 'Roboto Mono', 'Fira Code', 'Consolas', monospace",
        color: "#fff",
    },
    logoImage: {
        width: "120px",
        height: "auto",
        marginBottom: "15px",
        display: "block",
        margin: "0 auto 15px auto",
        filter: "drop-shadow(0 0 20px rgba(203, 32, 38, 0.5))",
    },
    logo: {
        fontSize: "12px",
        marginBottom: "10px",
        letterSpacing: "2px",
        color: "#888",
    },
    barContainer: {
        width: "100%",
        height: "4px",
        background: "rgba(255, 255, 255, 0.2)",
        position: "relative",
        borderRadius: "2px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
    },
    bar: (p) => ({
        width: `${p}%`,
        height: "100%",
        background: "linear-gradient(90deg, #CB2026, #FF3040)",
        transition: "width 0.2s ease",
        boxShadow: "0 0 20px #CB2026, 0 0 40px rgba(203, 32, 38, 0.5)",
        borderRadius: "2px",
    }),
    data: {
        marginTop: "15px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        letterSpacing: "1px",
        textShadow: "0 0 10px rgba(203, 32, 38, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    error: {
        marginTop: "10px",
        fontSize: "10px",
        color: "#ff4444",
        textAlign: "center",
        fontWeight: "bold",
    }
};
