'use client'
import { useGameStore } from '@/lib/store/gameStore'
import { motion } from 'framer-motion'

interface GameOverProps {
  onRestart: () => void
}

export default function GameOver({ onRestart }: GameOverProps) {
  const { score } = useGameStore()

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-black/90 border border-white/20 p-8 rounded-xl max-w-md w-full backdrop-blur-md"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <h2 className="text-red-500 text-4xl font-bold mb-6 text-center">GAME OVER</h2>
        
        <div className="mb-8 text-center">
          <p className="text-gray-400 mb-2">Final Score:</p>
          <p className="text-white text-3xl font-bold">{score}</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={onRestart}
            className="py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/30 rounded-md text-white font-bold transition-all"
          >
            Try Again
          </button>
        </div>
        
        <p className="mt-6 text-center text-gray-500 text-sm">
          Your spacecraft was destroyed. Be careful of asteroids and manage your health!
        </p>
      </motion.div>
    </motion.div>
  )
} 