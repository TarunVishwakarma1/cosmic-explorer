'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { useGameStore } from '@/lib/store/gameStore'
import { Vector3, Mesh } from 'three'
import { useSoundEffects } from '../audio/SoundManager'

interface MineralsProps {
  position: [number, number, number]
  size?: number
}

export default function Minerals({ position, size = 1 }: MineralsProps) {
  const [collected, setCollected] = useState(false)
  const { collectResource, updateMissionProgress, completeMission, currentLevel, levels } = useGameStore()
  const sounds = useSoundEffects()
  const mineralRef = useRef<Mesh>(null)
  const mineralPosition = useRef(new Vector3(...position))
  const rotationSpeed = useRef(0.02)
  
  const [ref] = useSphere(() => ({
    type: 'Static',
    position,
    args: [size * 2],
    isTrigger: true,
    onCollide: ({ body }) => {
      // Check if the colliding body is the spacecraft
      if (body.name === 'spacecraft' && !collected) {
        console.log('Mineral collected!') // Debug log
        setCollected(true)
        sounds.playCollectSound()
        
        // Collect mineral and update mission
        collectResource('minerals', 10)
        
        // Update collection mission
        const collectionMission = levels
          .find(l => l.id === currentLevel)
          ?.missions.find(m => m.type === 'collect')

        if (collectionMission) {
          const newProgress = collectionMission.current + 10
          updateMissionProgress(collectionMission.id, newProgress)
          
          // Check if mission is completed
          if (newProgress >= collectionMission.target) {
            completeMission(collectionMission.id)
            // Show level complete prompt
            const event = new CustomEvent('levelComplete', { 
              detail: { success: true } 
            })
            window.dispatchEvent(event)
          }
        }
      }
    },
  }))

  useFrame((state) => {
    if (mineralRef.current && !collected) {
      // Rotate the mineral
      mineralRef.current.rotation.y += rotationSpeed.current
      
      // Hover effect
      mineralRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.2
      
      // Add a slight wobble
      mineralRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1
    }
  })

  if (collected) return null

  return (
    <mesh ref={mineralRef} name="mineral">
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffa500"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
} 