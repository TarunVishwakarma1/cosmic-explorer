'use client'
import { useEffect, useRef } from 'react'
import { usePowerUpStore } from '@/lib/store/powerUpStore'
import { SpacecraftHandles } from '../models/Spacecraft'

interface KeyboardControlsProps {
  spacecraftRef: React.RefObject<SpacecraftHandles | null>
}

// This hook is rendered outside the Canvas and accesses the camera
export default function KeyboardControls({ spacecraftRef }: KeyboardControlsProps) {
  const { powerUps, activatePowerUp } = usePowerUpStore()
  const moveRef = useRef({ forward: 0, right: 0, up: 0, boost: false })
  
  // We track movement directions separate from ship controls
  // because we'll transform them based on camera direction
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!spacecraftRef.current) return
      
      // Handle input directly, but apply camera-relative movement in the update loop
      switch (e.code) {
        // Forward/backward movement
        case 'KeyW':
        case 'ArrowUp':
          moveRef.current.forward = 1
          break
        case 'KeyS':
        case 'ArrowDown':
          moveRef.current.forward = -1
          break
          
        // Left/right movement
        case 'KeyA':
        case 'ArrowLeft':
          moveRef.current.right = -1
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRef.current.right = 1
          break
          
        // Up/down movement
        case 'KeyQ':
          moveRef.current.up = 1
          break
        case 'KeyE':
          moveRef.current.up = -1
          break
          
        // Boost
        case 'ShiftLeft':
        case 'ShiftRight':
          moveRef.current.boost = true
          spacecraftRef.current.setBoost(true)
          break
          
        // Power-ups
        case 'Digit1':
          if (powerUps.shield.currentCooldown === 0) {
            activatePowerUp('shield')
          }
          break
        case 'Digit2':
          if (powerUps.speedBoost.currentCooldown === 0) {
            activatePowerUp('speedBoost')
          }
          break
        case 'Digit3':
          if (powerUps.weaponBoost.currentCooldown === 0) {
            activatePowerUp('weaponBoost')
          }
          break
        case 'Digit4':
          if (powerUps.fuelRecharge.currentCooldown === 0) {
            activatePowerUp('fuelRecharge')
          }
          break
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!spacecraftRef.current) return
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
          moveRef.current.forward = 0
          break
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRight':
          moveRef.current.right = 0
          break
        case 'KeyQ':
        case 'KeyE':
          moveRef.current.up = 0
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          moveRef.current.boost = false
          spacecraftRef.current.setBoost(false)
          break
      }
    }
    
    // Set up movement update loop to apply camera-relative movement
    const updateMovement = () => {
      if (!spacecraftRef.current) return
      
      // Send movement data to the spacecraft, which will handle camera-relative movement
      spacecraftRef.current.setCameraRelativeMovement(
        moveRef.current.forward, 
        moveRef.current.right, 
        moveRef.current.up
      )
    }
    
    // Update movement 60 times per second
    const intervalId = setInterval(updateMovement, 1000 / 60)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [spacecraftRef, powerUps, activatePowerUp])
  
  return null
} 