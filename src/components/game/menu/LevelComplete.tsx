'use client'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/lib/store/gameStore'

interface LevelCompleteProps {
  onNextLevel: () => void
  onRetry: () => void
  isSuccess: boolean
}

export default function LevelComplete({ onNextLevel, onRetry, isSuccess }: LevelCompleteProps) {
  const { currentLevel, levels, resources } = useGameStore()
  const nextLevel = levels.find(l => l.id === currentLevel + 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900/90 p-8 rounded-lg max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {isSuccess ? 'Level Complete!' : 'Level Failed'}
        </h2>
        
        {isSuccess && nextLevel && (
          <div className="mb-4 text-white">
            <p>Next Level: {nextLevel.name}</p>
            <p>Required Minerals: {nextLevel.requiredMinerals}</p>
            <p>Current Minerals: {resources.minerals}</p>
            {resources.minerals < nextLevel.requiredMinerals && (
              <p className="text-yellow-500 mt-2">
                You need more minerals to access the next level!
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4">
          {isSuccess ? (
            <Button
              onClick={onNextLevel}
              disabled={nextLevel && resources.minerals < nextLevel.requiredMinerals}
            >
              Next Level
            </Button>
          ) : (
            <Button onClick={onRetry}>Try Again</Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 