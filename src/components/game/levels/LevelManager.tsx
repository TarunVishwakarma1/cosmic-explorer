import { useEffect } from 'react'
import { useGameStore } from '@/lib/store/gameStore'
import { useTutorialStore } from '@/lib/store/tutorialStore'

interface LevelManagerProps {
  onLevelComplete: () => void
}

export default function LevelManager({ onLevelComplete }: LevelManagerProps) {
  const { currentLevel, levels, completeMission } = useGameStore()
  const { isActive: isTutorialActive } = useTutorialStore()
  const currentLevelData = levels.find(l => l.id === currentLevel)

  useEffect(() => {
    // Don't check for completion during tutorial
    if (isTutorialActive || !currentLevelData) return

    // Check if all missions are completed
    const allMissionsCompleted = currentLevelData.missions.every(
      mission => mission.current >= mission.target
    )

    if (allMissionsCompleted) {
      onLevelComplete()
    }
  }, [currentLevel, levels, isTutorialActive, currentLevelData, onLevelComplete])

  return null
} 