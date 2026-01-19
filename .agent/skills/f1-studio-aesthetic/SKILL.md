---
name: f1-studio-aesthetic
description: Enforces the specific "Shadow Box" visual style for the project. Use this whenever generating the Stage, Lights, or Environment components.
---

# F1 Studio Aesthetic Skill

This skill ensures the scene follows the "Dark, Matte, Premium" design language required by the Product Designer.

## When to use this skill

- When creating the main `Stage` or `Scene` component.
- When configuring lighting (`SpotLight`, `AmbientLight`).
- When adding the floor or background geometry.
- When setting up post-processing effects.

## How to use it

### 1. The "Void" Background

Never use a default white or black background.

- **Background Color**: `#111111` (Deep Grey).
- **Fog**: ALWAYS add fog to blend the floor into the background.

  ```jsx
  <color attach="background" args={['#111111']} />
  <fogExp2 attach="fog" args={['#111111', 0.05]} />
