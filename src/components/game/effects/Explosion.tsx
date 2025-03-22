'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { Vector3, MeshBasicMaterial, Mesh } from 'three'
import ParticleSystem from './ParticleSystem'

interface ExplosionProps {
  position: [number, number, number]
  duration?: number
  scale?: number
  onComplete?: () => void
}

export default function Explosion({ 
  position, 
  duration = 1, 
  scale = 1, 
  onComplete 
}: ExplosionProps) {
  const shockwaveRef = useRef<Mesh>(null)
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += delta
    
    if (shockwaveRef.current) {
      const progress = timeRef.current / duration
      const currentScale = Math.sin(progress * Math.PI) * 3 * scale
      shockwaveRef.current.scale.set(currentScale, currentScale, currentScale)
      const material = shockwaveRef.current.material as MeshBasicMaterial
      material.opacity = 1 - progress

      if (timeRef.current >= duration && onComplete) {
        onComplete()
      }
    }
  })

  return (
    <group position={position}>
      <Sphere ref={shockwaveRef} args={[1, 32, 32]}>
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={1}
          wireframe
        />
      </Sphere>
      <ParticleSystem
        count={50}
        color="#ff4400"
        size={0.2 * scale}
        spread={2 * scale}
        speed={5}
        lifetime={duration * 0.5}
      />
      <ParticleSystem
        count={30}
        color="#ffaa00"
        size={0.15 * scale}
        spread={1.5 * scale}
        speed={3}
        lifetime={duration * 0.8}
      />
    </group>
  )
} 