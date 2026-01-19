import { create } from 'zustand'

export const useStore = create((set, get) => ({
    // ===== FACE TRACKING STATE =====
    facePosition: { x: 0, y: 0 },
    faceScale: 1.0,
    calibrationOffset: { x: 0, y: 0 },
    isCalibrated: false,
    trackingStatus: 'DISCONNECTED', // DISCONNECTED, INITIALIZING, ACTIVE, TRACKING, ERROR, PERMISSION_DENIED, UNSUPPORTED

    // ===== INPUT MODE STATE =====
    // 'face' = webcam face tracking (desktop)
    // 'gyro' = device orientation (mobile)
    // 'mouse' = mouse fallback
    inputMode: 'mouse',
    gyroSupported: false,

    setInputMode: (mode) => set({ inputMode: mode }),
    setGyroSupported: (supported) => set({ gyroSupported: supported }),

    // ===== OFF-AXIS PROJECTION STATE =====
    // Screen physical dimensions in cm (default: 14" MacBook Pro)
    screenConfig: {
        width: 30.41,      // Physical screen width in cm
        height: 21.24,     // Physical screen height in cm
        distance: 50,      // Default viewing distance in cm
    },
    // Eye position relative to screen center (in cm)
    // x: positive = right, y: positive = up, z: positive = toward user
    eyePosition: { x: 0, y: 0, z: 50 },

    // ===== ACTIONS =====
    setFacePosition: (pos) => set({ facePosition: pos }),
    setFaceScale: (scale) => set({ faceScale: scale }),
    setTrackingStatus: (status) => set({ trackingStatus: status }),

    // Update eye position (called by CameraRig based on face tracking)
    setEyePosition: (pos) => set({ eyePosition: pos }),

    // Update screen config (if user provides different display size)
    setScreenConfig: (config) => set((state) => ({
        screenConfig: { ...state.screenConfig, ...config }
    })),


    // ===== IGNITION SEQUENCE STATE =====
    // ===== IGNITION SEQUENCE STATE =====
    isIgniting: false,
    triggerIgnition: () => set({ isIgniting: true }),
    stopIgnition: () => set({ isIgniting: false }),

    calibrate: () => {
        const current = get().facePosition
        set({
            calibrationOffset: { x: current.x, y: current.y },
            isCalibrated: true
        })
        // Reset isCalibrated after animation
        setTimeout(() => set({ isCalibrated: false }), 1500)
    }
}))
