import { create } from 'zustand'
import { useTutorialStore } from './tutorialStore'

export type PowerUpType = 'shield' | 'speedBoost' | 'weaponBoost' | 'fuelRecharge'

interface PowerUp {
  type: PowerUpType
  duration: number
  active: boolean
  cooldown: number
  currentCooldown: number
}

interface PowerUpState {
  powerUps: Record<PowerUpType, PowerUp>
  activatePowerUp: (type: PowerUpType) => void
  deactivatePowerUp: (type: PowerUpType) => void
  updateCooldowns: (delta: number) => void
  resetPowerUps: () => void
}

// Initial power-up state for reset functionality
const initialPowerUps: Record<PowerUpType, PowerUp> = {
  shield: {
    type: 'shield',
    duration: 10,
    active: false,
    cooldown: 30,
    currentCooldown: 0,
  },
  speedBoost: {
    type: 'speedBoost',
    duration: 5,
    active: false,
    cooldown: 15,
    currentCooldown: 0,
  },
  weaponBoost: {
    type: 'weaponBoost',
    duration: 8,
    active: false,
    cooldown: 20,
    currentCooldown: 0,
  },
  fuelRecharge: {
    type: 'fuelRecharge',
    duration: 3,
    active: false,
    cooldown: 25,
    currentCooldown: 0,
  },
};

export const usePowerUpStore = create<PowerUpState>((set) => ({
  powerUps: { ...initialPowerUps },
  activatePowerUp: (type) => {
    const tutorialStore = useTutorialStore.getState()
    if (tutorialStore.currentStep === 'powerups') {
      tutorialStore.completeStep('powerups')
    }
    set((state) => ({
      powerUps: {
        ...state.powerUps,
        [type]: {
          ...state.powerUps[type],
          active: true,
          currentCooldown: state.powerUps[type].cooldown,
        },
      },
    }))
  },
  deactivatePowerUp: (type) =>
    set((state) => ({
      powerUps: {
        ...state.powerUps,
        [type]: {
          ...state.powerUps[type],
          active: false,
        },
      },
    })),
  updateCooldowns: (delta) =>
    set((state) => ({
      powerUps: Object.entries(state.powerUps).reduce(
        (acc, [key, powerUp]) => ({
          ...acc,
          [key]: {
            ...powerUp,
            currentCooldown: Math.max(0, powerUp.currentCooldown - delta),
          },
        }),
        {} as Record<PowerUpType, PowerUp>
      ),
    })),
  resetPowerUps: () => set({ powerUps: { ...initialPowerUps } }),
})) 