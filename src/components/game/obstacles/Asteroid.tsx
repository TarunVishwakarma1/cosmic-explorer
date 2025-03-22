import { useRef, useState, useMemo } from 'react'
import { useConvexPolyhedron } from '@react-three/cannon'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Explosion from '../effects/Explosion'
import { useGameStore } from '@/lib/store/gameStore'

interface AsteroidProps {
  position: [number, number, number]
  size?: number
  onDestroyed?: () => void
}

export default function Asteroid({ position, size = 1, onDestroyed }: AsteroidProps) {
  const asteroidRef = useRef<THREE.Mesh>(null)
  const rotationSpeed = useRef([
    Math.random() * 0.01,
    Math.random() * 0.01,
    Math.random() * 0.01,
  ])
  const [isDestroyed, setIsDestroyed] = useState(false)

  // Load the 3D model and textures
  const { scene } = useGLTF('/models/asteroid.glb')
  const textures = useTexture({
    map: '/textures/asteroid/asteroid-color.png',
    aoMap: '/textures/asteroid/asteroid-ao.png',
    emissiveMap: '/textures/asteroid/asteroid-emissive.png',
    metalnessMap: '/textures/asteroid/asteroid-metal.png',
    normalMap: '/textures/asteroid/asteroid-normal.png',
    roughnessMap: '/textures/asteroid/asteroid-roughness.png'
  })

  // Reduce geometry detail on mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  // Generate collision geometry with reduced detail for mobile
  const { vertices, faces } = useMemo(() => {
    const detail = isMobile ? 0 : 1 // Reduce geometry detail on mobile
    const geo = new THREE.IcosahedronGeometry(size, detail)
    const vertices: [number, number, number][] = []
    const faces: number[][] = []

    for (let i = 0; i < geo.attributes.position.count; i++) {
      vertices.push([
        geo.attributes.position.getX(i),
        geo.attributes.position.getY(i),
        geo.attributes.position.getZ(i)
      ])
    }

    if (geo.index && geo.index.count > 0) {
      for (let i = 0; i < geo.index.count; i += 3) {
        faces.push([
          geo.index.getX(i),
          geo.index.getX(i + 1),
          geo.index.getX(i + 2)
        ])
      }
    } else {
      for (let i = 0; i < vertices.length; i += 3) {
        faces.push([i, i + 1, i + 2])
      }
    }

    return { vertices, faces }
  }, [size, isMobile])

  const [ref] = useConvexPolyhedron(() => ({
    mass: 0,
    position,
    args: [vertices, faces],
    onCollide: (e) => {
      if (e.body.name === 'spacecraft' && !isDestroyed) {
        onDestroyed?.()
        setIsDestroyed(true)
        useGameStore.getState().setHealth(
          Math.max(0, useGameStore.getState().health - 20)
        )
      }
    },
  }))

  useFrame(() => {
    if (asteroidRef.current && !isDestroyed) {
      asteroidRef.current.rotation.x += rotationSpeed.current[0]
      asteroidRef.current.rotation.y += rotationSpeed.current[1]
      asteroidRef.current.rotation.z += rotationSpeed.current[2]
    }
  })

  // Optimize textures for mobile
  useMemo(() => {
    Object.values(textures).forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      if (isMobile) {
        texture.minFilter = THREE.LinearFilter
        texture.generateMipmaps = false
      }
    })
  }, [textures])

  if (isDestroyed) {
    return <Explosion 
      position={position} 
      onComplete={() => {}} 
    />
  }

  // Apply textures to the model
  const asteroidModel = useMemo(() => {
    const model = scene.clone()
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = new THREE.MeshStandardMaterial({
          map: textures.map,
          aoMap: textures.aoMap,
          emissiveMap: textures.emissiveMap,
          metalnessMap: textures.metalnessMap,
          normalMap: textures.normalMap,
          roughnessMap: textures.roughnessMap,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.1,
          metalness: 0.8,
          roughness: 1.0,
        })
      }
    })
    return model
  }, [scene, textures])

  return (
    <group ref={ref as any}>
      <primitive 
        object={asteroidModel} 
        ref={asteroidRef}
        scale={[size, size, size]}
        castShadow
        receiveShadow
      />
    </group>
  )
}

useGLTF.preload('/models/asteroid.glb') 