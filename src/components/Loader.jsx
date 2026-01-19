import React from 'react';
import { useProgress } from "@react-three/drei";

export function Loader() {
    const { progress } = useProgress();

    return (
        <div style={styles.container(progress === 100)}>
            <div style={styles.content}>
                <div style={styles.logo}>ORACLE // RED BULL RACING</div>
                <div style={styles.barContainer}>
                    <div style={styles.bar(progress)} />
                </div>
                <div style={styles.data}>
                    LOADING ASSETS... {Math.round(progress)}%
                </div>
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
        background: "#111", // Dark Garage
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
        fontFamily: "'Courier New', monospace",
        color: "#fff",
    },
    logo: {
        fontSize: "12px",
        marginBottom: "10px",
        letterSpacing: "2px",
        color: "#888",
    },
    barContainer: {
        width: "100%",
        height: "2px",
        background: "#333",
        position: "relative",
    },
    bar: (p) => ({
        width: `${p}%`,
        height: "100%",
        background: "#00ffff", // Cyan Laser Color
        transition: "width 0.2s ease",
        boxShadow: "0 0 10px #00ffff",
    }),
    data: {
        marginTop: "10px",
        fontSize: "10px",
        color: "#00ffff",
        textAlign: "right",
    }
};
