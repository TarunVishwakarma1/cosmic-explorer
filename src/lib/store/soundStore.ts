import { create } from 'zustand'

interface SoundState {
  isMuted: boolean
  musicVolume: number
  sfxVolume: number
  setMuted: (muted: boolean) => void
  setMusicVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  setMuted: (muted) => set({ isMuted: muted }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
})) 