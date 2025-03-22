'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { Group, AdditiveBlending } from 'three'

interface SpaceEnvironmentProps {
  level: number
}

export default function SpaceEnvironment({ level }: SpaceEnvironmentProps) {
  const environmentRef = useRef<Group>(null)
  const nebulasRef = useRef<Group>(null)
  const time = useRef(0)
  
  // Animate nebulas
  useFrame((state, delta) => {
    time.current += delta * 0.05
    
    if (nebulasRef.current) {
      nebulasRef.current.rotation.y = time.current * 0.01
      nebulasRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(time.current * 0.1 + i) * 2
        child.rotation.z = time.current * 0.02 + i * 0.1
      })
    }
  })
  
  return (
    <group ref={environmentRef}>
      {/* Distant nebulas and galaxies */}
      {/* <group ref={nebulasRef} position={[0, 0, 0]} scale={50}>
        <DistantNebula position={[-3, 0, -5]} color="#5d00ff" scale={5} opacity={0.3} />
        <DistantNebula position={[4, 2, -6]} color="#ff5d00" scale={3} opacity={0.3} />
        <DistantNebula position={[0, -4, -7]} color="#00c3ff" scale={4} opacity={0.3} />
        <DistantNebula position={[-5, 3, -8]} color="#ff007b" scale={6} opacity={0.3} />
        
        {level > 1 && (
          <>
            <DistantNebula position={[5, -2, -9]} color="#008bff" scale={7} opacity={0.3} />
            <DistantNebula position={[-4, -3, -10]} color="#f700ff" scale={5} opacity={0.3} />
          </>
        )}
        
        {level > 2 && (
          <>
            <DistantNebula position={[0, 4, -8]} color="#ff0000" scale={8} opacity={0.3} />
            <DistantNebula position={[6, 1, -11]} color="#00ff8b" scale={6} opacity={0.3} />
          </>
        )}
      </group> */}
    </group>
  )
}

// Component for distant space elements like nebulas and galaxies
function DistantNebula({ 
  position, 
  color, 
  scale = 1,
  opacity = 0.3 
}: { 
  position: [number, number, number], 
  color: string, 
  scale?: number,
  opacity?: number 
}) {
  return (
    <Billboard 
      position={position}
      scale={[scale, scale, scale]}
      follow={true}
      lockX={false}
      lockY={false}
    >
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </Billboard>
  )
} 