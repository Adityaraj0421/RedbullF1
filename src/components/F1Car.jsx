import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function F1Car() {
    const { scene } = useGLTF('/models/f1_car.glb')

    useEffect(() => {
        console.log('🏎️ [F1Car] Applying Material Enhancements (Preserving Textures)')

        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                child.frustumCulled = false

                const mat = child.material
                if (!mat || Array.isArray(mat)) return

                try {
                    const name = child.name.toLowerCase()
                    const matName = mat.name ? mat.name.toLowerCase() : ''

                    // Basic part detection
                    const isTire = name.includes('tire') || name.includes('rubber') || name.includes('wheel') || matName.includes('tire') || matName.includes('rubber')
                    const isCarbon = name.includes('carbon') || name.includes('suspension') || name.includes('wing') || name.includes('floor') || name.includes('diffuser')
                    const isMetal = name.includes('metal') || name.includes('chrome') || name.includes('suspension') || matName.includes('metal')

                    // TIRES - Matte Rubber (preserve original color/texture)
                    if (isTire) {
                        mat.roughness = 0.95
                        mat.metalness = 0.0
                        mat.envMapIntensity = 0.3
                    }
                    // CARBON FIBER - Dark with some reflection (preserve original color/texture)
                    else if (isCarbon) {
                        mat.roughness = 0.5
                        mat.metalness = 0.6
                        mat.envMapIntensity = 1.2
                    }
                    // METAL PARTS - Reflective (preserve original color/texture)
                    else if (isMetal) {
                        mat.roughness = 0.3
                        mat.metalness = 0.95
                        mat.envMapIntensity = 1.5
                    }
                    // BODY PANELS - Basic enhancement (preserve original color/texture)
                    else {
                        if (mat.envMapIntensity !== undefined) {
                            mat.envMapIntensity = 1.5
                        }
                        if (mat.roughness !== undefined && mat.roughness > 0.5) {
                            mat.roughness = 0.4
                        }
                        if (mat.metalness !== undefined && mat.metalness < 0.5) {
                            mat.metalness = 0.6
                        }
                    }

                    // Ensure textures are properly configured
                    if (mat.map) {
                        mat.map.needsUpdate = true
                    }
                    mat.needsUpdate = true

                } catch (e) {
                    console.warn('F1Car Material Error:', e)
                }
            }
        })

        console.log('🏎️ [F1Car] Material Enhancement Complete (Textures Preserved)')
    }, [scene])

    return (
        <group dispose={null}>
            <primitive object={scene} scale={1} position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
    )
}
