'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import { Mesh, Group, Vector3, AdditiveBlending, Color } from 'three'
import { useGameStore } from '@/lib/store/gameStore'

interface ResourceProps {
  position: [number, number, number]
  type: 'mineral' | 'energy'
}

export default function Resource({ position, type }: ResourceProps) {
  const [collected, setCollected] = useState(false)
  const { collectResource } = useGameStore()
  
  // Physics body
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: [1, 1, 1],
    isTrigger: true,
    onCollide: (e) => {
      // Resource is collected when player collides with it
      if (!collected && e.body.name === 'spacecraft') {
        setCollected(true)
        
        // Convert type to match the expected parameter in gameStore
        const resourceType = type === 'mineral' ? 'minerals' : 'energy'
        collectResource(resourceType, 10)
        
        // Hide the resource when collected
        api.position.set(0, -1000, 0)
      }
    }
  }))
  
  // Animation
  const initialY = useRef(position[1])
  
  // Hover and rotate animation
  useFrame((state, delta) => {
    if (collected) return
    
    if (ref.current) {
      // Smoother hover effect with smaller amplitude
      const time = state.clock.getElapsedTime()
      ref.current.position.y = initialY.current + Math.sin(time * 1.5) * 0.15
      
      // Smooth rotation
      ref.current.rotation.y += delta * 0.8
    }
  })
  
  // Different appearance based on resource type
  const color = type === 'mineral' ? '#00a8ff' : '#ffcc00'
  const emissiveColor = type === 'mineral' ? '#0066ff' : '#ff6600'
  const scale = type === 'mineral' ? 0.8 : 0.9
  
  return (
    <mesh
      ref={ref as React.RefObject<Mesh>}
      scale={scale}
      name={`resource-${type}`}
    >
      {type === 'mineral' ? (
        <octahedronGeometry args={[1, 0]} />
      ) : (
        <dodecahedronGeometry args={[1, 0]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={0.5}
        toneMapped={false}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  )
} 