# Project Overview

**Concept:** An interactive 3D web experience where a high-fidelity F1 car sits inside a "Shadow Box" studio. The scene uses the user's webcam to track their head position, adjusting the 3D camera perspective in real-time (Off-Axis Projection) to create the illusion that the screen is a physical window into a void.

## Core Value Proposition

- **Visuals:** Photorealistic, cinematic lighting that showcases "Product Designer" aesthetics.
- **Tech:** Cutting-edge usage of client-side computer vision (MediaPipe) without latency.
- **Immersion:** Breaking the "fourth wall" via head-coupled perspective.

# User Experience (UX) Flow

## Onboarding

1. **User lands on the page.** Screen is dark with a subtle loader.
2. **Prompt:** "Allow Camera Access to Enter the Void." (Clean, minimal UI).
3. **Fallback:** If denied, default to Mouse/Gyroscope interaction.

## The Reveal

1. **Camera permissions granted** → The studio lights "flicker" on (bloom effect).
2. **The F1 car is revealed** in the center.

## The Interaction

- **User moves their head left** → The 3D camera pivots right (revealing the car's side).
- **User leans in** → The camera zooms in physically.
- **User leans back** → The camera retreats.

# Visual & Aesthetic Specifications

## The "Shadow Box" Environment

- **Geometry:** Floor, Ceiling, Back Wall. Open sides (fade to void).
- **Palette:** #111111 (Void), #151515 (Floor/Wall), #FFFFFF (Lights).
- **Atmosphere:** Heavy usage of FogExp2 (Density 0.05, Color #111111) to hide geometry edges.

## Lighting (The "Rembrandt" Setup)

- **Key Light:** SpotLight from Top-Right (Cool White).
- **Fill Light:** AmbientLight (Blue-ish tint, low intensity).
- **Practical Lights:** A 4x4 grid of Emissive Planes on the ceiling (for reflections).

## Materials

- **Floor:** MeshReflectorMaterial with roughness: 0.7 (Satin/Concrete finish).
- **Car:** Matte paint (Red Bull style), Carbon Fiber accents (Normal map noise), Rubber tires (High roughness).

# Technical Architecture

## Tech Stack

- **Framework:** React (Vite)
- **3D Engine:** `@react-three/fiber` (Three.js)
- **Helpers:** `@react-three/drei` (OrbitControls, Stage, Reflector)
- **Post-Processing:** `@react-three/postprocessing` (Bloom, Vignette)
- **Computer Vision:** `@mediapipe/tasks-vision` (Face Landmarker)
- **State Management:** `zustand` (Transient updates for 60fps loop)

## Component Architecture

- **App.jsx:** Main entry, handles Canvas and Suspense.
- **Scene.jsx:** Holds the lights, fog, and environment.
- **F1Car.jsx:** The GLTF model component with material overrides.
- **FaceTracker.jsx:** Invisible component managing the MediaPipe worker.
- **CameraRig.jsx:** The "Parallax Logic" component. Subscribes to FaceTracker store and updates `useThree().camera`.

## Data Flow (The Loop)

```mermaid
graph LR
    A[Webcam Feed] --> B[MediaPipe Worker]
    B -- Landmarks (x,y,z) --> C[Zustand Store]
    C -- Transient Update --> D[CameraRig (useFrame)]
    D -- Lerp/Smooth --> E[Three.js Camera]
```

# Functional Requirements (The "Agent Directives")

## Feature A: The Infinite Garage (Environment)

- **Req 1:** The floor must use `MeshReflectorMaterial` to reflect the car.
- **Req 2:** The background must seamlessly blend with the floor using Fog.
- **Req 3:** Ceiling lights must use `toneMapped={false}` to trigger the Bloom effect.

## Feature B: The Eye Tracker (Vision)

- **Req 1:** Initialize MediaPipe FaceLandmarker on mount.
- **Req 2:** Detect only 1 face.
- **Req 3:** Extract "Nose Tip" landmark (Index 1).
- **Req 4:** Normalize coordinates: Center = (0,0), Left = (-1), Right = (1).

## Feature C: The Parallax Engine (Math)

**Formula:**

- `TargetCamX = (NoseX * -1) * Sensitivity` (Invert movement).
- `TargetCamY = (NoseY) * Sensitivity`.
- **Smoothing:** Apply `MathUtils.lerp(current, target, 0.1)` every frame.
- **Constraint:** Camera must always `lookAt(0, 0, 0)`.

# Implementation Roadmap (Agent Plan)

## Phase 1: The "Visual Architect" (Setup)

- [x] Initialize Vite + R3F.
- [x] Configure the "Dark Mode" canvas (Colors, Fog).
- [x] Implement `Stage.jsx` with the Concrete Reflector floor.
- [x] Add Post-Processing (Bloom + Vignette).

## Phase 2: The "Subject" (Assets)

- [x] Load `f1_car.glb`.
- [x] Apply procedural Carbon Fiber materials.
- [x] Position car at `[0, 0, 0]`.

## Phase 3: The "Magic" (Vision)

- [x] Create `useFaceTracking` hook (MediaPipe logic).
- [x] Connect Webcam stream.
- [x] Debug mode: Draw a red dot on the screen where the nose is detected.

## Phase 4: The "Integration" (Rigging)

- [x] Connect Face Data → Camera Rig.
- [x] Tune "Sensitivity" and "Lerp" values for natural feeling.
- [x] Hide the webcam feed (UI clean up).

# Success Metrics

- **Performance:** Maintains 60 FPS on a standard laptop (M1/M2/RTX 3060).
- **Latency:** Head tracking feels "instant" (sub-100ms delay).
- **Aesthetic:** The floor reflection is blurry (matte), not sharp (mirror).
