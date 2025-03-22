'use client'
import { useEffect, useState, useRef } from 'react'
import { useSoundStore } from '@/lib/store/soundStore'

const SOUNDS = {
  engine: '/sounds/engine.mp3',
  boost: '/sounds/boost.mp3',
  collision: '/sounds/collision.mp3',
  collect: '/sounds/collect.mp3',
  bgMusic: '/sounds/background.mp3',
} as const

const audioRefs: Record<keyof typeof SOUNDS, HTMLAudioElement> = {} as any

const playSound = (audio: HTMLAudioElement) => {
  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Ignore autoplay errors
    })
  }
}

export default function SoundManager() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const { isMuted, musicVolume, sfxVolume } = useSoundStore()
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Create and resume AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }

    // Create audio elements
    Object.entries(SOUNDS).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.loop = key === 'bgMusic' || key === 'engine'
      audio.volume = key === 'bgMusic' ? musicVolume : sfxVolume
      audioRefs[key as keyof typeof SOUNDS] = audio
    })

    // Start background music
    if (!isMuted) {
      const bgMusic = audioRefs.bgMusic
      bgMusic.volume = musicVolume
      playSound(bgMusic)
    }

    return () => {
      Object.values(audioRefs).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [musicVolume, sfxVolume, isMuted])

  return null
}

export const useSoundEffects = () => {
  return {
    playEngineSound: () => playSound(audioRefs.engine),
    playBoostSound: () => playSound(audioRefs.boost),
    playCollisionSound: () => playSound(audioRefs.collision),
    playCollectSound: () => playSound(audioRefs.collect),
  }
} 