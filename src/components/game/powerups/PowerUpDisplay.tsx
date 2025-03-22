import { motion } from 'motion/react'
import { usePowerUpStore, PowerUpType } from '@/lib/store/powerUpStore'

const POWER_UP_ICONS: Record<PowerUpType, string> = {
  shield: '🛡️',
  speedBoost: '⚡',
  weaponBoost: '🎯',
  fuelRecharge: '⚡',
}

export default function PowerUpDisplay() {
  const { powerUps } = usePowerUpStore()

  return (
    <div className="absolute right-4 top-32 flex flex-col gap-2">
      {Object.entries(powerUps).map(([type, powerUp]) => (
        <motion.div
          key={type}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
            ${powerUp.active ? 'bg-blue-500/50' : 'bg-black/50'}
            ${powerUp.currentCooldown > 0 ? 'opacity-50' : 'opacity-100'}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="relative">
            {POWER_UP_ICONS[type as PowerUpType]}
            {powerUp.currentCooldown > 0 && (
              <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-white">
                {Math.ceil(powerUp.currentCooldown)}s
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
} 