import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useStore } from '../store'

export function F1HUD() {
    const calibrate = useStore((state) => state.calibrate)
    const isCalibrated = useStore((state) => state.isCalibrated)
    const trackingStatus = useStore((state) => state.trackingStatus)
    const triggerIgnition = useStore((state) => state.triggerIgnition)
    const isIgniting = useStore((state) => state.isIgniting)

    // RPM Animation State
    const [rpm, setRpm] = useState(0)

    // Auto-hide State
    const [visible, setVisible] = useState(true)
    const timeoutRef = useRef(null)

    // Responsive State
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 600)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const resetTimer = useCallback(() => {
        setVisible(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setVisible(false)
        }, 3000) // Hide after 3 seconds
    }, [])

    // Show on state changes
    useEffect(() => {
        resetTimer()
    }, [trackingStatus, isCalibrated, isIgniting, resetTimer])

    // Show on user activity
    useEffect(() => {
        const handleActivity = () => resetTimer()
        window.addEventListener('mousemove', handleActivity)
        window.addEventListener('keydown', handleActivity)
        window.addEventListener('click', handleActivity)
        window.addEventListener('touchstart', handleActivity)

        return () => {
            window.removeEventListener('mousemove', handleActivity)
            window.removeEventListener('keydown', handleActivity)
            window.removeEventListener('click', handleActivity)
            window.removeEventListener('touchstart', handleActivity)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [resetTimer])

    useEffect(() => {
        let interval
        if (isIgniting) {
            // Rev up quickly
            interval = setInterval(() => {
                setRpm(prev => Math.min(prev + 5, 100))
            }, 30)
        } else {
            // Die down instantly
            setRpm(0)
        }
        return () => clearInterval(interval)
    }, [isIgniting])


    // RPM LED HELPERS (memoized for performance)
    // 0-30: Green, 30-60: Red, 60-100: Blue
    const totalLeds = 15
    const ledElements = useMemo(() => {
        return [...Array(totalLeds)].map((_, i) => {
            const threshold = (i / totalLeds) * 100
            const active = rpm > threshold

            let color = '#444' // off
            let glow = 'none'

            if (active) {
                if (i < 5) color = '#CB2026' // Red Bull Red - Low RPM
                else if (i < 10) color = '#ff3333' // Bright Red - Mid RPM
                else color = '#CB2026' // Red Bull Red - High RPM
                glow = `0 0 10px ${color}`
            }

            return (
                <div key={i} style={{
                    width: '6%',
                    height: '8px',
                    backgroundColor: color,
                    borderRadius: '2px',
                    boxShadow: glow,
                    transition: 'background-color 0.05s'
                }} />
            )
        })
    }, [rpm])

    return (
        <div style={{
            position: 'fixed',
            bottom: isMobile ? '10px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '90%' : '320px',
            maxWidth: '320px',
            zIndex: 100,
            fontFamily: "'Inter', sans-serif",
            userSelect: 'none',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: visible ? 'auto' : 'none'
        }}>

            {/* --- MAIN LCD SCREEN CONTAINER --- */}
            <div style={{
                background: '#0a0a0a',
                border: '4px solid #1a1a1a',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                position: 'relative',
                overflow: 'hidden'
            }}>

                {/* 1. RPM LED BAR */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '4px',
                    background: '#000',
                    borderRadius: '4px'
                }}>
                    {ledElements}
                </div>

                {/* 2. MAIN DATA DISPLAY (Grid) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr 1fr',
                    gap: '8px',
                    alignItems: 'center'
                }}>

                    {/* LEFT COLUMN: Tires/Temps */}
                    <div style={{ textAlign: 'left', fontSize: '10px', color: '#888', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                            <span style={{ color: '#FFC906' }}>TYRE</span> <span style={{ color: '#fff' }}>SOFT</span>
                        </div>
                        <div>
                            <span>FL</span> <span style={{ color: '#fff', fontSize: '12px' }}>98°</span>
                        </div>
                        <div>
                            <span>FR</span> <span style={{ color: '#fff', fontSize: '12px' }}>96°</span>
                        </div>
                    </div>

                    {/* CENTER COLUMN: GEAR */}
                    <div style={{
                        textAlign: 'center',
                        background: isIgniting ? '#220000' : 'transparent',
                        borderRadius: '8px',
                        padding: isMobile ? '2px' : '4px'
                    }}>
                        <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#ff3333', fontWeight: 'bold' }}>GEAR</div>
                        <div style={{
                            fontSize: isMobile ? '48px' : '64px',
                            lineHeight: '1',
                            fontWeight: '800',
                            color: isIgniting ? '#fff' : '#444'
                        }}>
                            {isIgniting ? Math.floor(Math.random() * 2) + 1 : 'N'}
                        </div>
                        <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#fff' }}>
                            {isIgniting ? '12,430' : '0'} <span style={{ fontSize: isMobile ? '6px' : '8px', color: '#666' }}>RPM</span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Delta/Lap */}
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#888', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                            <span style={{ color: '#CB2026' }}>DELTA</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#CB2026', fontWeight: 'bold' }}>
                            -0.412
                        </div>
                        <div style={{ marginTop: '4px' }}>
                            LAST LAP
                        </div>
                        <div style={{ color: '#fff' }}>
                            1:24.3
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM BAR: ERS / Status */}
                <div style={{
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ color: '#FFC906' }}>ERS</span>
                        <div style={{ width: '40px', height: '4px', background: '#333' }}>
                            <div style={{ width: '80%', height: '100%', background: '#FFC906' }} />
                        </div>
                    </div>
                    {/* Status Text from Store */}
                    <div style={{
                        color: trackingStatus === 'ACTIVE' ? '#CB2026' : 'orange',
                        fontWeight: 'bold'
                    }}>
                        {trackingStatus}
                    </div>
                </div>

            </div>


            {/* --- PHYSICAL BUTTONS (Underneath) --- */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                padding: '0 20px'
            }}>

                {/* CALIBRATE BUTTON GROUP */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button
                        onClick={calibrate}
                        style={{
                            background: '#e0e0e0',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            boxShadow: '0 4px 0 #999, 0 5px 10px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transform: isCalibrated ? 'translateY(2px)' : 'none',
                            transition: 'transform 0.1s'
                        }}
                        title="Calibrate Center"
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            background: '#ffcc00',
                            borderRadius: '50%',
                            border: '2px solid #ccc'
                        }} />
                    </button>
                    <span style={{
                        fontSize: '10px',
                        color: '#ff3333',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>CALIB</span>
                </div>

                {/* IGNITE BUTTON GROUP */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button
                        onClick={triggerIgnition}
                        disabled={isIgniting}
                        style={{
                            background: '#e0e0e0',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            boxShadow: '0 4px 0 #999, 0 5px 10px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transform: isIgniting ? 'translateY(4px)' : 'none',
                            transition: 'transform 0.1s'
                        }}
                        title="Ignition Start"
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            background: '#CB2026',
                            borderRadius: '50%',
                            border: '2px solid #ccc'
                        }} />
                    </button>
                    <span style={{
                        fontSize: '10px',
                        color: '#ff3333',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>IGNITE</span>
                </div>

            </div>

        </div>
    )
}
