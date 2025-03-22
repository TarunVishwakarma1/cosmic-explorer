import { motion } from 'motion/react'
import { useGameStore } from '@/lib/store/gameStore'
import { useEffect, useRef } from 'react'
import { useTutorialStore } from '@/lib/store/tutorialStore'

export default function MissionTracker() {
  const { currentLevel, levels, updateMissionProgress, completeMission } = useGameStore()
  const { isActive: isTutorialActive } = useTutorialStore()
  const currentLevelData = levels.find(l => l.id === currentLevel)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastUpdateRef = useRef(0)
  
  useEffect(() => {
    if (isTutorialActive || !currentLevelData) return

    // Reset timer when level changes
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    startTimeRef.current = Date.now()
    lastUpdateRef.current = 0

    const collectionMission = currentLevelData.missions.find(m => m.type === 'collect')
    const survivalMission = currentLevelData.missions.find(m => m.type === 'survive')

    if (survivalMission && !survivalMission.completed) {
      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return
        
        const currentTime = Date.now()
        const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000)
        
        if (elapsedSeconds !== lastUpdateRef.current) {
          lastUpdateRef.current = elapsedSeconds
          updateMissionProgress(survivalMission.id, elapsedSeconds)
          
          if (elapsedSeconds >= survivalMission.target) {
            completeMission(survivalMission.id)
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
          }
        }
      }, 1000)
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentLevel, currentLevelData?.id, isTutorialActive, updateMissionProgress, completeMission]) 

  // Don't show missions during tutorial
  if (isTutorialActive || !currentLevelData) return null

  return (
    <motion.div
      className="absolute left-4 top-32 bg-black/50 p-4 rounded-lg text-white font-mono"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-lg mb-2">Level {currentLevel}: {currentLevelData.name}</h3>
      <div className="space-y-2">
        {currentLevelData.missions.map(mission => (
          <div key={mission.id} className="text-sm">
            <div className="flex justify-between">
              <span>{mission.description}</span>
              <span>{mission.current}/{mission.target}</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(mission.current / mission.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
} 