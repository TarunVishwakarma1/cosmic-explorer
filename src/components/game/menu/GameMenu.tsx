import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/lib/store/gameStore'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useSoundStore } from '@/lib/store/soundStore'

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
  onRestart: () => void
}

export default function GameMenu({ isOpen, onClose, onRestart }: GameMenuProps) {
  const { score, resources } = useGameStore()
  const { isMuted, musicVolume, sfxVolume, setMuted, setMusicVolume, setSfxVolume } = useSoundStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900/90 p-8 rounded-lg max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Game Menu</h2>
            
            <div className="space-y-4 mb-6">
              <div className="text-white">
                <p>Score: {score}</p>
                <p>Minerals: {resources.minerals}</p>
                <p>Energy: {resources.energy}</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-white text-lg font-semibold">Sound Settings</h3>
              <div className="flex items-center justify-between">
                <span className="text-white">Mute All</span>
                <Switch
                  checked={isMuted}
                  onCheckedChange={setMuted}
                />
              </div>
              <div className="space-y-2">
                <label className="text-white text-sm">Music Volume</label>
                <Slider
                  value={[musicVolume * 100]}
                  onValueChange={([value]) => setMusicVolume(value / 100)}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-white text-sm">SFX Volume</label>
                <Slider
                  value={[sfxVolume * 100]}
                  onValueChange={([value]) => setSfxVolume(value / 100)}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Resume Game
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onRestart}
              >
                Restart Game
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Quit Game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 