'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface TutorialProps {
  onClose: () => void
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [step, setStep] = useState(0)
  
  const tutorialSteps = [
    {
      title: "Welcome to Cosmic Explorer",
      content: "You are a space explorer on a mission to collect resources and survive in the vastness of space. Let's learn the controls!",
      image: "/images/tutorial/intro.png"
    },
    {
      title: "Moving Your Spacecraft",
      content: "Use WASD or arrow keys to move. The spacecraft moves in the direction the camera is facing. Q and E keys move up and down.",
      image: "/images/tutorial/movement.png"
    },
    {
      title: "Camera Controls",
      content: "Right-click and drag to rotate the camera. Use the mouse wheel to zoom in and out. Double-click to toggle camera view modes.",
      image: "/images/tutorial/camera.png"
    },
    {
      title: "Collecting Resources",
      content: "Fly through minerals (blue) and energy cells (yellow) to collect them. You'll need these to complete missions.",
      image: "/images/tutorial/resources.png"
    },
    {
      title: "Power-Ups",
      content: "Press 1-4 keys to activate power-ups: Shield (1), Speed Boost (2), Weapon Boost (3), and Fuel Recharge (4).",
      image: "/images/tutorial/powerups.png"
    }
  ]
  
  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }
  
  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }
  
  const handleSkip = () => {
    onClose();
  }
  
  const currentStep = tutorialSteps[step]
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 rounded-lg border border-white/20 max-w-2xl w-full mx-4"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{currentStep.title}</h2>
          
          <div className="mb-6 h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
            {/* Placeholder for tutorial images */}
            <div className="text-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>{currentStep.image ? "Tutorial image" : "Illustration would be here"}</p>
            </div>
          </div>
          
          <p className="text-white mb-8">{currentStep.content}</p>
          
          <div className="flex justify-between">
            <button 
              onClick={handlePrevious}
              disabled={step === 0}
              className={`px-4 py-2 rounded ${step === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Previous
            </button>
            
            <button 
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {step < tutorialSteps.length - 1 ? "Next" : "Start Game"}
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === step ? 'bg-blue-500' : 'bg-gray-600'}`}
                onClick={() => setStep(index)}
              />
            ))}
          </div>
          
          <button 
            onClick={handleSkip}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Skip Tutorial
          </button>
        </div>
      </motion.div>
    </div>
  )
} 