import { useState, useEffect } from 'react'
import { usePowerUpStore, PowerUpType } from '@/lib/store/powerUpStore'

interface Controls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  boost: boolean
}

export function useKeyboardControls() {
  const [controls, setControls] = useState<Controls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  })
  const { powerUps, activatePowerUp } = usePowerUpStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((controls) => ({ ...controls, forward: true }))
          break
        case 'ArrowDown':
        case 'KeyS':
          setControls((controls) => ({ ...controls, backward: true }))
          break
        case 'ArrowLeft':
        case 'KeyA':
          setControls((controls) => ({ ...controls, left: true }))
          break
        case 'ArrowRight':
        case 'KeyD':
          setControls((controls) => ({ ...controls, right: true }))
          break
        case 'ShiftLeft':
          setControls((controls) => ({ ...controls, boost: true }))
          break
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

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((controls) => ({ ...controls, forward: false }))
          break
        case 'ArrowDown':
        case 'KeyS':
          setControls((controls) => ({ ...controls, backward: false }))
          break
        case 'ArrowLeft':
        case 'KeyA':
          setControls((controls) => ({ ...controls, left: false }))
          break
        case 'ArrowRight':
        case 'KeyD':
          setControls((controls) => ({ ...controls, right: false }))
          break
        case 'ShiftLeft':
          setControls((controls) => ({ ...controls, boost: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [powerUps, activatePowerUp])

  return controls
} 