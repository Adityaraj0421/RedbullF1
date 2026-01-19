---
name: parallax-camera-logic
description: Logic for calculating Off-Axis Projection (Parallax) based on face data. Use this when connecting the FaceTracker data to the Camera Rig.
---

# Parallax Camera Logic

This skill defines the mathematical formula to create the "Window into a Void" illusion.

## When to use this skill

- When creating the `CameraRig` component.
- When updating `state.camera.position` inside `useFrame`.

## How to use it

### 1. The Inverse Movement Rule

To mimic a physical window, the camera must move in the **opposite** direction of the head.

- If Face moves **Right** (+X), Camera moves **Left** (-X).
- If Face moves **Up** (-Y), Camera moves **Down** (+Y).

### 2. The Smoothing Formula (Lerp)

Raw MediaPipe data is jittery. Always apply Linear Interpolation.

```javascript
// targetPos is the calculated destination based on face
// currentPos is camera.position
currentPos.lerp(targetPos, 0.1) // 0.1 is the dampening factor
