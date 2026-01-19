---
name: r3f-asset-loading
description: Best practices for loading 3D GLTF models and Textures in React Three Fiber. Use this when importing the F1 car or setting up the floor materials.
---

# R3F Asset Loading

Ensures assets are loaded efficiently with proper shadows and React Suspense handling.

## When to use this skill

- When creating the `F1Car.jsx` component.
- When loading textures for the `Stage`.

## How to use it

### 1. The Hook Pattern

Use the specific hooks from `@react-three/drei` and `@react-three/fiber`.

- Models: `const { scene } = useGLTF('/models/f1_car.glb')`
- Textures: `const props = useTexture({ map: '...', normalMap: '...' })`

### 2. Shadow Configuration

GLTF models do not cast shadows by default in Three.js. You must traverse the scene graph.

```javascript
useEffect(() => {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      // Optional: Fix material envMap intensity if it looks too dark
      if (child.material) child.material.envMapIntensity = 1
    }
  })
}, [scene])
