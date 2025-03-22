'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/lib/store/gameStore'
import { useEffect, useState } from 'react'

interface HUDProps {
  onOpenMenu: () => void
}

export default function HUD({ onOpenMenu }: HUDProps) {
  const { health, fuel, score, resources } = useGameStore()
  const [prevHealth, setPrevHealth] = useState(health)
  const [prevFuel, setPrevFuel] = useState(fuel)
  const [prevScore, setPrevScore] = useState(score)
  const [showHealthChange, setShowHealthChange] = useState(false)
  const [showScoreChange, setShowScoreChange] = useState(false)

  // Track health changes for visual effects
  useEffect(() => {
    if (health !== prevHealth) {
      if (health < prevHealth) {
        // Health decreased
        setShowHealthChange(true)
        setTimeout(() => setShowHealthChange(false), 1000)
      }
      setPrevHealth(health)
    }
  }, [health, prevHealth])

  // Track score changes for visual effects
  useEffect(() => {
    if (score !== prevScore) {
      setShowScoreChange(true)
      setTimeout(() => setShowScoreChange(false), 1000)
      setPrevScore(score)
    }
  }, [score, prevScore])

  // Track fuel changes
  useEffect(() => {
    setPrevFuel(fuel)
  }, [fuel])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top left stats */}
      <motion.div 
        className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white font-mono"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-3">
          <div className={`relative ${showHealthChange ? 'text-red-500' : ''}`}>
            <div className="flex justify-between mb-1">
              <span>Health:</span>
              <span>{Math.floor(health)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-red-500"
                initial={{ width: `${prevHealth}%` }}
                animate={{ width: `${health}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              />
            </div>
            {showHealthChange && (
              <motion.div 
                className="absolute -right-6 top-0 text-red-500 font-bold"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0 }}
              >
                {health - prevHealth < 0 ? `${Math.floor(health - prevHealth)}` : ''}
              </motion.div>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Fuel:</span>
              <span>{Math.floor(fuel)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: `${prevFuel}%` }}
                animate={{ width: `${fuel}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              />
            </div>
          </div>

          <div className={`${showScoreChange ? 'text-green-400' : ''}`}>
            <div className="flex justify-between">
              <span>Score:</span>
              <div className="relative">
                <motion.span
                  key={score}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                >
                  {score}
                </motion.span>
                {showScoreChange && (
                  <motion.div 
                    className="absolute -right-6 top-0 text-green-400 font-bold"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0 }}
                  >
                    +{score - prevScore}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Resources display */}
      <motion.div 
        className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white font-mono"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Minerals:</span>
            <motion.span
              key={resources.minerals}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {resources.minerals}
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Energy:</span>
            <motion.span
              key={resources.energy}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {resources.energy}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Menu button */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <Button 
          variant="outline"
          className="bg-black/70 backdrop-blur-sm text-white hover:bg-black/80"
          onClick={onOpenMenu}
        >
          Menu
        </Button>
      </div>
    </div>
  )
} 