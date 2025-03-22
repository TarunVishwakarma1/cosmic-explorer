import { useRef, useState } from 'react'
import { useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/lib/store/gameStore'
import { useSoundEffects } from './audio/SoundManager'
import ParticleSystem from './effects/ParticleSystem'

interface ResourceProps {
  position: [number, number, number]
  type: 'minerals' | 'energy'
}

export default function Resource({ position, type }: ResourceProps) {
  const [collected, setCollected] = useState(false)
  const [showCollectEffect, setShowCollectEffect] = useState(false)
  const sounds = useSoundEffects()
  const { currentLevel, levels, updateMissionProgress, completeMission, collectResource, addScore } = useGameStore()
  
  const [ref] = useSphere(() => ({
    type: 'Static',
    position,
    args: [0.5],
    isTrigger: true,
    onCollide: ({ body }) => {
      if (body.name === 'spacecraft' && !collected) {
        setCollected(true)
        sounds.playCollectSound()
        
        // Collect resource and add score
        collectResource(type, 10)
        addScore(50)

        // Update collection missions
        const collectionMission = levels
          .find(l => l.id === currentLevel)
          ?.missions.find(m => m.type === 'collect')

        if (collectionMission) {
          const newProgress = collectionMission.current + 10
          updateMissionProgress(collectionMission.id, newProgress)
          if (newProgress >= collectionMission.target) {
            completeMission(collectionMission.id)
          }
        }
      }
    },
  }))

  const color = type === 'minerals' ? '#ffd700' : '#00ffff'

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y += 0.02
    }
  })

  const handleCollect = () => {
    setShowCollectEffect(true)
    setTimeout(() => {
      setCollected(true)
    }, 1000)
  }

  if (collected) return null

  return (
    <group position={position}>
      <mesh ref={ref as any}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={showCollectEffect ? 0 : 0.8}
        />
      </mesh>
      {showCollectEffect && (
        <ParticleSystem
          count={20}
          color={color}
          size={0.1}
          spread={0.5}
          speed={1}
          position={position}
        />
      )}
    </group>
  )
} 