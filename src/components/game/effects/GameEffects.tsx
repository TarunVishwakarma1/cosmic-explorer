'use client'
import { 
  EffectComposer, 
  Bloom, 
  Noise, 
  Vignette 
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

interface GameEffectsProps {
  bloomIntensity?: number
  noiseIntensity?: number
}

export default function GameEffects({ 
  bloomIntensity = 0.5,
  noiseIntensity = 0.2
}: GameEffectsProps) {
  return (
    <EffectComposer>
      <Bloom 
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
      <Noise 
        blendFunction={BlendFunction.OVERLAY}
        opacity={noiseIntensity}
      />
      <Vignette
        offset={0.5}
        darkness={0.5}
        eskil={false}
      />
    </EffectComposer>
  )
} 