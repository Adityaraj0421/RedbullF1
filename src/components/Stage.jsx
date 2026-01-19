import React, { useRef } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial, useTexture, Environment, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { useStore } from '../store'

// Initialize RectAreaLight uniforms (call once)
RectAreaLightUniformsLib.init()

// Physical Shadow Box - Museum Display Case Aesthetic
export function Stage() {
  // Helper for texture cloning/repeating
  const useClonedTextures = (textures, repeat) => {
    return React.useMemo(() => {
      return textures.map(t => {
        const c = t.clone()
        c.wrapS = c.wrapT = THREE.RepeatWrapping
        c.repeat.set(repeat[0], repeat[1])
        c.needsUpdate = true
        return c
      })
    }, [textures, repeat[0], repeat[1]])
  }

  // Load "Corrugated Iron" base textures
  const baseTextures = useTexture([
    '/corrugated_iron_02_4k/textures/corrugated_iron_02_diff_4k.jpg',
    '/corrugated_iron_02_4k/textures/corrugated_iron_02_disp_4k.png',
    '/corrugated_iron_02_4k/textures/corrugated_iron_02_nor_gl_4k.jpg',
    '/corrugated_iron_02_4k/textures/corrugated_iron_02_rough_4k.jpg',
    '/corrugated_iron_02_4k/textures/corrugated_iron_02_metal_4k.jpg'
  ])

  // Derive scaled versions
  const [sideDiff, sideDisp, sideNor, sideRough, sideMetal] = useClonedTextures(baseTextures, [2, 1])
  const [backDiff, backDisp, backNor, backRough, backMetal] = useClonedTextures(baseTextures, [1.75, 1])
  const [ceilDiff, ceilDisp, ceilNor, ceilRough, ceilMetal] = useClonedTextures(baseTextures, [1.75, 2])

  // Load "Asphalt Pit Lane" textures
  const [diffuse, roughness, normal] = useTexture([
    '/asphalt_pit_lane_4k/textures/asphalt_pit_lane_diff_4k.jpg',
    '/asphalt_pit_lane_4k/textures/asphalt_pit_lane_rough_4k.jpg',
    '/asphalt_pit_lane_4k/textures/asphalt_pit_lane_nor_gl_4k.jpg'
  ])

  const isIgniting = useStore((state) => state.isIgniting)
  const mainLight = useRef()
  const rimLightLeft = useRef()
  const rimLightRight = useRef()
  const backRimLight = useRef()
  const ledStrip1 = useRef()
  const ledStrip2 = useRef()
  const laserStrip1 = useRef()
  const laserStrip2 = useRef()

  useFrame(() => {
    // Basic lighting flicker during ignition
    if (isIgniting) {
      const flicker = Math.random() > 0.1 ? (1 + Math.random() * 0.5) : 0.8
      if (mainLight.current) mainLight.current.intensity = 4.0 * flicker
      if (rimLightLeft.current) rimLightLeft.current.intensity = 2.0 * flicker
      if (rimLightRight.current) rimLightRight.current.intensity = 2.0 * flicker
      if (backRimLight.current) backRimLight.current.intensity = 5.0 * flicker
    } else {
      if (mainLight.current && mainLight.current.intensity !== 4.0) mainLight.current.intensity = 4.0
      if (rimLightLeft.current && rimLightLeft.current.intensity !== 2.0) rimLightLeft.current.intensity = 2.0
      if (rimLightRight.current && rimLightRight.current.intensity !== 2.0) rimLightRight.current.intensity = 2.0
      if (backRimLight.current && backRimLight.current.intensity !== 5.0) backRimLight.current.intensity = 5.0
    }
  })

  return (
    <>
      {/* 1. The Dark "Void" Background */}
      <color attach="background" args={['#000000']} />
      <fogExp2 attach="fog" args={['#000000', 0.08]} />

      {/* 2. Environment */}
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr"
        blur={1}
      />

      {/* 3. LIGHTING */}
      <ambientLight color="#ffffff" intensity={0.1} />

      <rectAreaLight
        ref={mainLight}
        width={6}
        height={4}
        intensity={4.0}
        position={[0, 2.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#fff0dd"
      />

      <spotLight
        ref={rimLightLeft}
        position={[-3, 2, -2]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#3366ff"
        castShadow={false}
        target-position={[0, 0.5, 0]}
      />

      <spotLight
        ref={rimLightRight}
        position={[3, 2, -2]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#ffaa00"
        castShadow={true}
        shadow-bias={-0.0001}
        target-position={[0, 0.5, 0]}
      />

      <spotLight
        ref={backRimLight}
        position={[0, 2, -4]}
        angle={0.5}
        penumbra={1}
        intensity={5}
        color="#00ffff"
        castShadow={true}
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
        target-position={[0, 0, 0]}
      />

      {/* 4. PADDOCK STRUCTURE */}

      {/* CEILING */}
      <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 8]} />
        <MeshReflectorMaterial
          map={ceilDiff}
          displacementMap={ceilDisp}
          normalMap={ceilNor}
          roughnessMap={ceilRough}
          metalnessMap={ceilMetal}
          displacementScale={0.05}
          color="#aaaaaa"
          roughness={0.4}
          metalness={0.8}
          mirror={0.5}
          mixStrength={1.5}
          minDepthThreshold={0}
          maxDepthThreshold={1.4}
          depthScale={1}
          reflectorOffset={0}
          resolution={1024}
        />
      </mesh>

      {/* LIGHT PANEL */}
      <mesh position={[0, 2.49, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* LEFT WALL */}
      <mesh position={[-3.5, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 2.5, 0.2]} />
        <MeshReflectorMaterial
          map={sideDiff}
          displacementMap={sideDisp}
          normalMap={sideNor}
          roughnessMap={sideRough}
          metalnessMap={sideMetal}
          displacementScale={0.05}
          color="#aaaaaa"
          roughness={0.4}
          metalness={0.8}
          mirror={0.5}
          mixStrength={1.5}
          minDepthThreshold={0}
          maxDepthThreshold={1.4}
          depthScale={1}
          reflectorOffset={0}
          resolution={1024}
        />
      </mesh>

      {/* RIGHT WALL */}
      <mesh position={[3.5, 1.25, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 2.5, 0.2]} />
        <MeshReflectorMaterial
          map={sideDiff}
          displacementMap={sideDisp}
          normalMap={sideNor}
          roughnessMap={sideRough}
          metalnessMap={sideMetal}
          displacementScale={0.05}
          color="#aaaaaa"
          roughness={0.4}
          metalness={0.8}
          mirror={0.5}
          mixStrength={1.5}
          minDepthThreshold={0}
          maxDepthThreshold={1.4}
          depthScale={1}
          reflectorOffset={0}
          resolution={1024}
        />
      </mesh>

      {/* BACK WALL */}
      <group position={[0, 1.25, -3.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[7, 2.5, 0.2]} />
          <MeshReflectorMaterial
            map={backDiff}
            displacementMap={backDisp}
            normalMap={backNor}
            roughnessMap={backRough}
            metalnessMap={backMetal}
            displacementScale={0.05}
            color="#aaaaaa"
            roughness={0.4}
            metalness={0.8}
            mirror={0.5}
            mixStrength={1.5}
            minDepthThreshold={0}
            maxDepthThreshold={1.4}
            depthScale={1}
            reflectorOffset={0}
            resolution={1024}
          />
        </mesh>
      </group>

      {/* 5. LED/LASER STRIPS */}

      {/* Blue LED strips at walls */}
      <mesh ref={ledStrip1} position={[-3.48, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 24]} />
        <meshStandardMaterial color="#3366ff" emissive="#3366ff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh ref={ledStrip2} position={[3.48, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 24]} />
        <meshStandardMaterial color="#3366ff" emissive="#3366ff" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Cyan Pit Lane Lasers */}
      <mesh ref={laserStrip1} position={[-2.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 24]} />
        <meshStandardMaterial emissive="#00ffff" emissiveIntensity={4} color="#000000" toneMapped={false} />
      </mesh>
      <mesh ref={laserStrip2} position={[2.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 24]} />
        <meshStandardMaterial emissive="#00ffff" emissiveIntensity={4} color="#000000" toneMapped={false} />
      </mesh>

      {/* 6. FLOOR - Asphalt Pit Lane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[10, 24]} />
        <meshStandardMaterial
          map={diffuse}
          roughnessMap={roughness}
          normalMap={normal}
          normalScale={[0.5, 0.5]}
          color="#333333"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>



      {/* 7. ATMOSPHERE - Basic Dust Particles */}
      <Sparkles
        count={100}
        scale={[12, 6, 12]}
        size={2}
        speed={0.2}
        opacity={0.4}
        color="#dcb25c"
        position={[0, 2, 0]}
      />
    </>
  )
}
