import { useMemo } from 'react'
import Asteroid from './obstacles/Asteroid'
import Resource from './Resource'
import { useGameStore } from '@/lib/store/gameStore'

type ResourceType = 'minerals' | 'energy'

export default function GameEnvironment() {
  const { currentLevel } = useGameStore()
  
  const { asteroids, resources } = useMemo(() => {
    const asteroidCount = Math.min(5 + currentLevel * 2, 20)
    const resourceCount = Math.min(3 + currentLevel, 10)
    
    return {
      asteroids: Array.from({ length: asteroidCount }, () => ({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
        ] as [number, number, number],
        size: 1 + Math.random() * 2,
      })),
      resources: Array.from({ length: resourceCount }, () => ({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
        ] as [number, number, number],
        type: (Math.random() > 0.5 ? 'minerals' : 'energy') as ResourceType,
      })),
    }
  }, [currentLevel])

  return (
    <>
      {asteroids.map((asteroid, index) => (
        <Asteroid
          key={`asteroid-${index}`}
          position={asteroid.position}
          size={asteroid.size}
        />
      ))}
      {resources.map((resource, index) => (
        <Resource
          key={`resource-${index}`}
          position={resource.position}
          type={resource.type}
        />
      ))}
    </>
  )
} 