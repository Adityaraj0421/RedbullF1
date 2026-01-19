---
name: mediapipe-vision-setup
description: Handles the initialization and configuration of MediaPipe Face Landmarker for web. Use this when creating the FaceTracker component.
---

# MediaPipe Vision Setup

Standard procedure for implementing robust, client-side face tracking without crashing the React render loop.

## When to use this skill

- When creating the `FaceTracker` component.
- When configuring the MediaPipe `FilesetResolver`.
- When debugging webcam permissions.

## How to use it

### 1. Initialization Pattern

Always initialize the `FilesetResolver` and `FaceLandmarker` inside a `useEffect` to avoid blocking the main thread.

- **Task Path**: Use the CDN URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm`.
- **Model Asset**: Use `FACE_LANDMARKER_LITE` for speed.

### 2. Configuration Options

Strictly apply these settings to the `FaceLandmarker.createFromOptions()` method:

```javascript
runningMode: "VIDEO",
numFaces: 1, // We only track the user
minFaceDetectionConfidence: 0.5,
minFacePresenceConfidence: 0.5,
minTrackingConfidence: 0.5
