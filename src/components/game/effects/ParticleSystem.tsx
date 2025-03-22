'use client'
import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  count: number
  color: string | THREE.Color
  size?: number
  spread?: number
  lifetime?: number
  speed?: number
  position?: [number, number, number]
}

export default function ParticleSystem({
  count,
  color,
  size = 0.1,
  spread = 1,
  lifetime = 1,
  speed = 1,
  position = [0, 0, 0],
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const velocitiesRef = useRef<THREE.Vector3[]>([])

  // Create and memoize the geometry
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * spread
      positions[i3 + 1] = (Math.random() - 0.5) * spread
      positions[i3 + 2] = (Math.random() - 0.5) * spread
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [count, spread])

  // Create velocities only once
  useLayoutEffect(() => {
    velocitiesRef.current = Array(count).fill(0).map(() => 
      new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      )
    )
  }, [count, speed])

  // Create material
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  }, [color, size])
  
  // Create points object
  const points = useMemo(() => {
    return new THREE.Points(geometry, material)
  }, [geometry, material])

  // Update particle positions
  useFrame((_, delta) => {
    if (!points || velocitiesRef.current.length === 0) return
    
    const positions = points.geometry.attributes.position
    
    if (!positions) return
    
    const posArray = positions.array as Float32Array
    const velocities = velocitiesRef.current
    
    if (velocities.length !== count || posArray.length !== count * 3) return
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const velocity = velocities[i]
      
      if (i3 + 2 < posArray.length) {
        posArray[i3] += velocity.x * delta
        posArray[i3 + 1] += velocity.y * delta
        posArray[i3 + 2] += velocity.z * delta
        
        // Reset particle position when it goes too far
        if (Math.abs(posArray[i3]) > spread * 2 ||
            Math.abs(posArray[i3 + 1]) > spread * 2 ||
            Math.abs(posArray[i3 + 2]) > spread * 2) {
          posArray[i3] = (Math.random() - 0.5) * spread
          posArray[i3 + 1] = (Math.random() - 0.5) * spread
          posArray[i3 + 2] = (Math.random() - 0.5) * spread
        }
      }
    }
    
    positions.needsUpdate = true
  })

  return (
    <group position={position}>
      <primitive object={points} ref={pointsRef} />
    </group>
  )
} 