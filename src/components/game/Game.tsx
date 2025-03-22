'use client'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Stars } from '@react-three/drei'
import { useState, useEffect, useRef, useMemo } from 'react'
import Spacecraft, { SpacecraftHandles } from './models/Spacecraft'
import HUD from './HUD'
import GameMenu from './menu/GameMenu'
import MissionTracker from './missions/MissionTracker'
import { useGameStore } from '@/lib/store/gameStore'
import SoundManager from './audio/SoundManager'
import PowerUpDisplay from './powerups/PowerUpDisplay'
import { usePowerUpStore, PowerUpType } from '@/lib/store/powerUpStore'
import { useTutorialStore } from '@/lib/store/tutorialStore'
import MobileControls from './controls/MobileControls'
import KeyboardControls from './controls/KeyboardControls'
import ControlsHelp from './controls/ControlsHelp'
import CameraControls from './controls/CameraControls'
import GameOver from './menu/GameOver'
import LevelComplete from './menu/LevelComplete'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Environment from './Environment'
import SpaceEnvironment from './SpaceEnvironment'
import TutorialOverlay from './tutorial/TutorialOverlay'
import AsteroidField from './obstacles/AsteroidField'
import Minerals from './items/Minerals'

export default function Game() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  // If on mobile, only show the message
  if (isMobile) {
    return <MobileControls />
  }

  // Game state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [isLevelSuccess, setIsLevelSuccess] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60) // 60 seconds per level
  
  // Access game stores
  const { currentLevel, setLevel, health, gameOver, resetGame, levels } = useGameStore()
  const { updateCooldowns, deactivatePowerUp, powerUps, resetPowerUps } = usePowerUpStore()
  const { isActive: showTutorial, endTutorial } = useTutorialStore()
  
  // Refs
  const spacecraftRef = useRef<SpacecraftHandles | null>(null)
  
  // Event handlers
  const handleLevelComplete = (success: boolean) => {
    setIsLevelSuccess(success)
    setShowLevelComplete(true)
  }

  const handleNextLevel = () => {
    const currentLevelData = levels.find((l: { id: number }) => l.id === currentLevel)
    const nextLevelData = levels.find((l: { id: number }) => l.id === currentLevel + 1)
    
    if (!currentLevelData || !nextLevelData) return

    // Check if player has enough minerals for the next level
    const { resources } = useGameStore.getState()
    if (resources.minerals < nextLevelData.requiredMinerals) {
      // Show a message that more minerals are needed
      alert(`You need ${nextLevelData.requiredMinerals} minerals to access the next level. Current minerals: ${resources.minerals}`)
      return
    }

    setShowLevelComplete(false)
    setLevel(currentLevel + 1)
    setTimeRemaining(60) // Reset timer for next level
  }

  const handleRestartGame = () => {
    resetGame()
    resetPowerUps()
    setIsMenuOpen(false)
  }

  const handleRetryLevel = () => {
    // First reset all game states
    resetGame()
    resetPowerUps()
    setTimeRemaining(60)
    setIsLevelSuccess(false)
    setIsMenuOpen(false)
    
    // Reset spacecraft position and rotation
    if (spacecraftRef.current) {
      spacecraftRef.current.resetPosition()
      spacecraftRef.current.resetRotation()
    }
    
    // Reset level completion state
    const currentLevelData = levels.find((l: { id: number }) => l.id === currentLevel)
    if (currentLevelData) {
      currentLevelData.missions.forEach((mission: { completed: boolean; current: number }) => {
        mission.completed = false
        mission.current = 0
      })
    }
    
    // Force a re-render of the asteroid field and hide level complete overlay
    setShowLevelComplete(false)
    
    // Reset game over state
    useGameStore.getState().setGameOver(false)
    
    // Reset health and fuel
    useGameStore.getState().setHealth(100)
    useGameStore.getState().setFuel(100)
    
    // Reset resources
    useGameStore.getState().collectResource('minerals', -useGameStore.getState().resources.minerals)
    useGameStore.getState().collectResource('energy', -useGameStore.getState().resources.energy)
    
    // Reset score
    useGameStore.getState().addScore(-useGameStore.getState().score)
    
    // Force a re-render of the asteroid field by remounting it
    const asteroidField = document.querySelector('.asteroid-field')
    if (asteroidField) {
      asteroidField.remove()
    }
  }

  // Game over detection
  useEffect(() => {
    if (health <= 0) {
      console.log("Game Over: Health depleted")
    }
  }, [health])

  // Handle power-up timers and cooldowns
  useEffect(() => {
    // Only run timers if game is not over
    if (gameOver) return

    let powerUpTimers: Record<string, NodeJS.Timeout> = {}

    // Set up timers for active power-ups
    Object.entries(powerUps).forEach(([type, powerUp]) => {
      if (powerUp.active) {
        powerUpTimers[type] = setTimeout(() => {
          deactivatePowerUp(type as PowerUpType)
        }, powerUp.duration * 1000)
      }
    })

    // Update cooldowns
    const interval = setInterval(() => {
      updateCooldowns(0.1)
    }, 100)

    return () => {
      Object.values(powerUpTimers).forEach(timer => clearTimeout(timer))
      clearInterval(interval)
    }
  }, [powerUps, gameOver, deactivatePowerUp, updateCooldowns])

  // Timer effect
  useEffect(() => {
    if (gameOver || showLevelComplete) return

    // Reset timer when level changes or retry is pressed
    setTimeRemaining(60)

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleLevelComplete(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      setTimeRemaining(60) // Ensure timer is reset when effect is cleaned up
    }
  }, [gameOver, showLevelComplete, currentLevel]) // Added currentLevel as dependency

  // Check for level success
  useEffect(() => {
    if (gameOver || showLevelComplete) return

    const currentLevelData = levels.find((l: { id: number }) => l.id === currentLevel)
    if (!currentLevelData) return

    const collectionMission = currentLevelData.missions.find((m: { type: string }) => m.type === 'collect')
    const survivalMission = currentLevelData.missions.find((m: { type: string }) => m.type === 'survive')

    if (collectionMission?.completed && survivalMission?.completed) {
      handleLevelComplete(true)
    }
  }, [currentLevel, levels, gameOver, showLevelComplete])

  // Mobile controls handlers
  const handleMobileMove = (x: number, y: number) => {
    if (spacecraftRef.current) {
      spacecraftRef.current.setMoveX(x)
      spacecraftRef.current.setMoveY(y)
    }
  }

  const handleMobileBoost = (active: boolean) => {
    if (spacecraftRef.current) {
      spacecraftRef.current.setBoost(active)
    }
  }

  // Prevent right-click context menu on the game canvas
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const gameContainer = document.getElementById('game-canvas-container')
      if (gameContainer && gameContainer.contains(e.target as Node)) {
        e.preventDefault()
      }
    }

    window.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  const handleCloseTutorial = () => {
    endTutorial()
  }

  // Add minerals to the scene
  const minerals = useMemo(() => {
    const mineralCount = Math.min(5 + currentLevel * 2, 15)
    return Array.from({ length: mineralCount }, () => {
      // Create a more scattered pattern
      const x = (Math.random() - 0.5) * 100 // Random X between -50 and 50
      const y = (Math.random() - 0.5) * 100 // Random Y between -50 and 50
      const z = (Math.random() - 0.5) * 100 // Random Z between -50 and 50
      
      return {
        position: [x, y, z] as [number, number, number],
        size: 0.5 + Math.random() * 0.5,
      }
    })
  }, [currentLevel])

  // Handle level complete event
  useEffect(() => {
    const handleLevelComplete = (event: CustomEvent) => {
      handleLevelComplete(event.detail.success)
    }

    window.addEventListener('levelComplete', handleLevelComplete as EventListener)
    return () => {
      window.removeEventListener('levelComplete', handleLevelComplete as EventListener)
    }
  }, [])

  return (
    <div className="h-screen w-screen bg-black fixed inset-0 overflow-hidden">
      {/* Audio */}
      <SoundManager />
      
      {/* Controls */}
      <KeyboardControls spacecraftRef={spacecraftRef} />
      <ControlsHelp />
      
      {/* Game UI */}
      <HUD onOpenMenu={() => setIsMenuOpen(true)} />
      <MissionTracker />
      <PowerUpDisplay />
      <MobileControls
      />
      
      {/* Game Canvas */}
      <div className="game-canvas-container">
        <Canvas
          shadows
          className="r3f-canvas"
          camera={{ 
            position: [0, 5, 15],
            fov: 50,
            rotation: [0, Math.PI, 0]
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Physics
            gravity={[0, 0, 0]}
            defaultContactMaterial={{
              friction: 0.5,
              restitution: 0.4
            }}
          >
            <ambientLight intensity={0.2} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.0}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#5d8df7" />
            
            {/* Game elements */}
            <Environment background={false} preset="night" />
            
            <SpaceEnvironment level={currentLevel} />
            <AsteroidField 
              level={currentLevel} 
              onLevelComplete={() => handleLevelComplete(true)} 
            />
            {minerals.map((mineral, index) => (
              <Minerals
                key={`mineral-${index}`}
                position={mineral.position}
                size={mineral.size}
              />
            ))}
            <Spacecraft ref={spacecraftRef} initialRotation={[0, Math.PI, 0]} />
            <CameraControls spacecraftRef={spacecraftRef} followMode={true} />
          </Physics>
          
          <Stars radius={150} depth={80} count={8000} factor={6} saturation={0.8} fade speed={0.5} />
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              intensity={1.5}
              kernelSize={3}
            />
          </EffectComposer>
        </Canvas>
      </div>
      
      {/* Game states */}
      {gameOver && <GameOver onRestart={handleRestartGame} />}
      {showLevelComplete && (
        <LevelComplete 
          onNextLevel={handleNextLevel}
          onRetry={handleRetryLevel}
          isSuccess={isLevelSuccess}
        />
      )}
      <GameMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onRestart={handleRestartGame}
      />
      <TutorialOverlay />
    </div>
  )
} 