'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTutorialStore, TutorialStep } from '@/lib/store/tutorialStore'

type Position = {
  top: string
  left: string
  transform: string
}

const TUTORIAL_CONTENT: Record<TutorialStep, {
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}> = {
  movement: {
    title: 'Basic Movement',
    description: 'Use WASD or Arrow keys to move your spacecraft.',
    target: '.spacecraft',
    position: 'bottom',
  },
  boost: {
    title: 'Boost',
    description: 'Hold SHIFT to activate boost for increased speed.',
    target: '.boost-indicator',
    position: 'right',
  },
  powerups: {
    title: 'Power-ups',
    description: 'Press 1-4 to activate power-ups when available.',
    target: '.power-ups',
    position: 'left',
  },
  resources: {
    title: 'Resources',
    description: 'Collect minerals and energy to complete missions.',
    target: '.resources',
    position: 'top',
  },
  missions: {
    title: 'Missions',
    description: 'Complete missions to progress through levels.',
    target: '.missions',
    position: 'left',
  },
  complete: {
    title: 'Tutorial Complete!',
    description: 'You\'re ready to explore the cosmos. Good luck!',
  },
}

const getPositionStyles = (target: string | null, position: 'top' | 'bottom' | 'left' | 'right' | null): Position => {
  if (typeof window === 'undefined') return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  if (!target || !position) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  
  const element = document.querySelector(target)
  if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  const rect = element.getBoundingClientRect()
  const padding = 20

  switch (position) {
    case 'top':
      return { top: `${rect.top - padding}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)' }
    case 'bottom':
      return { top: `${rect.bottom + padding}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)' }
    case 'left':
      return { top: `${rect.top + rect.height / 2}px`, left: `${rect.left - padding}px`, transform: 'translateY(-50%)' }
    case 'right':
      return { top: `${rect.top + rect.height / 2}px`, left: `${rect.right + padding}px`, transform: 'translateY(-50%)' }
    default:
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
}

export default function TutorialOverlay() {
  const { isActive, currentStep, completeStep, setCurrentStep, endTutorial } = useTutorialStore()
  const [position, setPosition] = useState<Position>({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })

  useEffect(() => {
    if (isActive && currentStep) {
      const content = TUTORIAL_CONTENT[currentStep]
      setPosition(getPositionStyles(content.target || null, content.position || null))
    }
  }, [isActive, currentStep])

  if (!isActive) return null

  const content = TUTORIAL_CONTENT[currentStep]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute bg-white text-black p-4 rounded-lg shadow-lg max-w-sm"
          style={position}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <h3 className="text-lg font-bold mb-2">{content.title}</h3>
          <p className="text-sm mb-4">{content.description}</p>
          <div className="flex justify-between">
            <button
              onClick={() => {
                completeStep(currentStep)
                const steps = Object.keys(TUTORIAL_CONTENT) as TutorialStep[]
                const currentIndex = steps.indexOf(currentStep)
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1])
                } else {
                  endTutorial()
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {currentStep === 'complete' ? 'Start Game' : 'Next'}
            </button>
            <button
              onClick={() => endTutorial()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Skip Tutorial
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 