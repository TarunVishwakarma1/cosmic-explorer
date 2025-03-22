'use client'
import { Environment as DreiEnvironment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Color, Fog } from 'three'

interface EnvironmentProps {
  background?: boolean
  files?: string
  preset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'
}

export default function Environment({ 
  background = false, 
  files, 
  preset = 'night' 
}: EnvironmentProps) {
  const { scene } = useThree()
  
  // Set scene fog and background
  useEffect(() => {
    if (background) {
      scene.background = new Color('#000408')
    }
    
    // Add fog to create depth
    scene.fog = new Fog(new Color('#000408').getHex(), 50, 180)
    
    return () => {
      scene.fog = null
    }
  }, [scene, background])
  
  return (
    <DreiEnvironment 
      background={background}
      files={files}
      preset={files ? undefined : preset}
    />
  )
} 