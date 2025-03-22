import { useMemo, useState, useEffect } from 'react'
import Asteroid from './Asteroid'

interface AsteroidFieldProps {
  level: number
  onLevelComplete: () => void
}

export default function AsteroidField({ level, onLevelComplete }: AsteroidFieldProps) {
  const [destroyedAsteroids, setDestroyedAsteroids] = useState(new Set())
  const isMobile = useMemo(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), [])

  // Reset destroyed asteroids when level changes
  useEffect(() => {
    setDestroyedAsteroids(new Set())
  }, [level])

  // Generate asteroids based on level
  const asteroids = useMemo(() => {
    const count = isMobile 
      ? Math.min(10 + level * 5, 67) // Reduced count for mobile
      : Math.min(30 + level * 10, 200) // Full count for desktop

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
      ] as [number, number, number],
      size: 1 + Math.random() * 2,
    }))
  }, [level, isMobile])

  // Check for level completion
  useEffect(() => {
    if (destroyedAsteroids.size === asteroids.length) {
      onLevelComplete()
    }
  }, [destroyedAsteroids.size, asteroids.length, onLevelComplete])

  const handleAsteroidDestroyed = (id: number) => {
    setDestroyedAsteroids(prev => new Set(prev).add(id))
  }

  return (
    <group name="asteroid-field">
      {asteroids.map((asteroid, index) => (
        <Asteroid
          key={`asteroid-${index}`}
          position={asteroid.position}
          size={asteroid.size}
          onDestroyed={() => handleAsteroidDestroyed(index)}
        />
      ))}
    </group>
  )
} 