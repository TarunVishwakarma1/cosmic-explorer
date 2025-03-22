import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useBox, CollideEvent } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '@/lib/store/gameStore'
import { Mesh, Group, Vector3, Object3D, MeshStandardMaterial, Quaternion, Matrix4 } from 'three'
import { useSoundEffects } from '../audio/SoundManager'
import { usePowerUpStore } from '@/lib/store/powerUpStore'
import ParticleSystem from '../effects/ParticleSystem'
import { useTutorialStore } from '@/lib/store/tutorialStore'
import Explosion from '../effects/Explosion'

interface ControlState {
  moveX: number
  moveY: number
  moveZ: number
  boost: boolean
}

export interface SpacecraftHandles {
  setMoveX: (value: number) => void
  setMoveY: (value: number) => void
  setMoveZ: (value: number) => void
  setBoost: (active: boolean) => void
  getPosition: () => Vector3
  setCameraRelativeMovement: (forward: number, right: number, up: number) => void
  resetPosition: () => void
  resetRotation: () => void
}

interface SpacecraftProps {
  initialRotation?: [number, number, number]
}

const Spacecraft = forwardRef<SpacecraftHandles, SpacecraftProps>((props, ref) => {
  const { initialRotation = [0, Math.PI, 0] } = props
  const { setFuel, health, gameOver } = useGameStore()
  const modelRef = useRef<Group>(null)
  const sounds = useSoundEffects()
  const controlsRef = useRef<ControlState>({
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    boost: false,
  })
  const powerUps = usePowerUpStore((state) => state.powerUps)
  const { currentStep, completeStep } = useTutorialStore()
  const lastDamageTime = useRef(0)
  const [showExplosion, setShowExplosion] = useState(false)
  const explosionPosition = useRef<[number, number, number]>([0, 0, 0])
  const currentPosition = useRef(new Vector3(0, 0, 0))
  const { camera } = useThree()

  // Box collision physics setup
  const [boxRef, api] = useBox(() => ({
    mass: 1,
    position: [0, 0, 0],
    rotation: initialRotation,
    args: [2, 1, 4],
    linearDamping: 0.99,
    angularDamping: 0.99,
    material: {
      friction: 0.1,
      restitution: 0.7
    },
    name: 'spacecraft',
    onCollide: handleCollision,
  }))

  // Load 3D model
  const { scene } = useGLTF('/models/spacecraft.glb')

  // Store initial position and collision state
  const initialPosition = useRef(new Vector3(0, 0, 0))
  const isColliding = useRef(false)
  const lastCollisionTime = useRef(0)
  const shouldReturnToPosition = useRef(false)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setMoveX: (value: number) => {
      controlsRef.current.moveX = value
    },
    setMoveY: (value: number) => {
      controlsRef.current.moveY = value
    },
    setMoveZ: (value: number) => {
      controlsRef.current.moveZ = value
    },
    setBoost: (active: boolean) => {
      controlsRef.current.boost = active
    },
    getPosition: () => {
      return currentPosition.current.clone()
    },
    setCameraRelativeMovement: (forward: number, right: number, up: number) => {
      // Get camera's forward and right vectors
      const cameraForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      
      // Calculate movement direction based on camera orientation
      // Forward/backward movement along camera's forward vector (excluding Y component for "plane" movement)
      cameraForward.y = 0;
      if (cameraForward.length() > 0) cameraForward.normalize();
      
      // Left/right movement along camera's right vector (excluding Y component)
      cameraRight.y = 0;
      if (cameraRight.length() > 0) cameraRight.normalize();
      
      // Calculate final movement vector by combining directions
      const moveDirection = new Vector3();
      moveDirection.addScaledVector(cameraForward, forward);
      moveDirection.addScaledVector(cameraRight, right);
      
      // Handle up/down movement directly on Y axis
      moveDirection.y = up;
      
      // Apply movement to spacecraft controls
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
      }
      
      controlsRef.current.moveX = moveDirection.x;
      controlsRef.current.moveY = moveDirection.z;
      controlsRef.current.moveZ = moveDirection.y;
    },
    resetPosition: () => {
      api.position.set(0, 0, 0)
      api.velocity.set(0, 0, 0)
    },
    resetRotation: () => {
      api.rotation.set(initialRotation[0], initialRotation[1], initialRotation[2])
      api.angularVelocity.set(0, 0, 0)
      api.angularFactor.set(1, 1, 1)
    }
  }))

  // Handle collisions with obstacles
  const handleCollision = (e: CollideEvent) => {
    const now = Date.now()
    if (now - lastDamageTime.current > 500) {
      lastDamageTime.current = now
      
      // Calculate and apply damage
      const impactVelocity = e.contact.impactVelocity
      const damageAmount = Math.min(20, Math.max(5, Math.abs(impactVelocity) * 2))
      const finalDamage = powerUps.shield.active 
        ? Math.floor(damageAmount * 0.5) 
        : Math.floor(damageAmount)

      // Update health
      const currentHealth = useGameStore.getState().health
      useGameStore.getState().setHealth(currentHealth - finalDamage)
      
      // Visual and sound effects
      sounds.playCollisionSound()
      explosionPosition.current = [
        e.contact.contactPoint[0], 
        e.contact.contactPoint[1], 
        e.contact.contactPoint[2]
      ]
      setShowExplosion(true)
      setTimeout(() => setShowExplosion(false), 1000)

      // Lock rotation completely
      api.angularVelocity.set(0, 0, 0)
      api.angularFactor.set(0, 0, 0) // This prevents any rotation
      api.rotation.set(initialRotation[0], initialRotation[1], initialRotation[2])
    }
  }

  // Add this useEffect to reset angular factor when component unmounts
  useEffect(() => {
    return () => {
      api.angularFactor.set(1, 1, 1) // Reset angular factor on cleanup
    }
  }, [])

  // Update position tracking
  useEffect(() => {
    const unsubscribe = api.position.subscribe((pos) => {
      currentPosition.current.set(pos[0], pos[1], pos[2])
    })
    return unsubscribe
  }, [api.position])

  useFrame((state, delta) => {
    if (gameOver) return;
    
    const baseSpeed = 5
    const baseRotationSpeed = 2

    // Apply power-up effects
    const speed = powerUps.speedBoost.active ? baseSpeed * 2 : baseSpeed
    const damageMultiplier = powerUps.shield.active ? 0.5 : 1

    if (controlsRef.current.moveX !== 0 || controlsRef.current.moveY !== 0 || controlsRef.current.moveZ !== 0) {
      sounds.playEngineSound()
    }

    // Get camera's forward and right vectors for movement direction
    const cameraForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    // Calculate movement direction based on camera orientation
    const moveDirection = new Vector3();
    
    // Add camera-relative movement components with inverted forward/backward
    if (controlsRef.current.moveY !== 0) { // Forward/backward
      moveDirection.addScaledVector(cameraForward, -controlsRef.current.moveY); // Added negative sign
    }
    if (controlsRef.current.moveX !== 0) { // Left/right
      moveDirection.addScaledVector(cameraRight, controlsRef.current.moveX);
    }
    
    // Handle vertical movement separately
    moveDirection.y = controlsRef.current.moveZ;
    
    // Only update rotation if there's movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      
      // Calculate target rotation to face movement direction
      const targetRotation = new Quaternion();
      const up = new Vector3(0, 1, 0);
      targetRotation.setFromRotationMatrix(
        new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          moveDirection,
          up
        )
      );
      
      // Apply rotation if not colliding
      if (!isColliding.current) {
        api.quaternion.copy(targetRotation);
      }
    }

    // Apply velocity
    const velocity = {
      x: moveDirection.x * speed * (controlsRef.current.boost ? 2 : 1),
      y: moveDirection.y * speed * (controlsRef.current.boost ? 2 : 1),
      z: moveDirection.z * speed * (controlsRef.current.boost ? 2 : 1)
    };
    
    api.velocity.set(velocity.x, velocity.y, velocity.z);

    // Update visual effects based on active power-ups
    if (modelRef.current) {
      // Shield effect
      if (powerUps.shield.active) {
        modelRef.current.traverse((child: Object3D) => {
          if (child instanceof Mesh && 'material' in child) {
            const material = child.material as MeshStandardMaterial
            material.emissive.setHex(0x00ff00)
            material.emissiveIntensity = 0.5
          }
        })
      } else {
        modelRef.current.traverse((child: Object3D) => {
          if (child instanceof Mesh && 'material' in child) {
            const material = child.material as MeshStandardMaterial
            material.emissive.setHex(0x000000)
            material.emissiveIntensity = 0
          }
        })
      }

      // Speed boost effect
      if (powerUps.speedBoost.active) {
        modelRef.current.traverse((child: Object3D) => {
          if (child instanceof Mesh && 'material' in child) {
            const material = child.material as MeshStandardMaterial
            material.emissive.setHex(0xff0000)
            material.emissiveIntensity = 0.3
          }
        })
      }
    }
    
    // Tutorial step completion checks
    if (currentStep === 'movement' && 
        (controlsRef.current.moveX !== 0 || controlsRef.current.moveY !== 0 || controlsRef.current.moveZ !== 0)) {
      completeStep('movement')
    }
    
    if (currentStep === 'boost' && controlsRef.current.boost) {
      completeStep('boost')
    }
  })

  return (
    <>
      <group
        ref={boxRef as any}
        dispose={null}
      >
        <group 
          ref={modelRef} 
          scale={[0.005, 0.005, 0.005]} 
          position={[0, -0, -1.5]} 
          rotation={initialRotation}
        >
          <primitive object={scene.clone()} />
        </group>
        
        {/* Engine particles */}
        <ParticleSystem 
          count={50}
          position={[0, 0, 0]}
          color="#3498db"
          size={0.1}
          speed={5}
          spread={0.2}
        />
      </group>
      
      {/* Explosion effect on collision */}
      {showExplosion && (
        <Explosion 
          position={explosionPosition.current}
          scale={0.5}
        />
      )}
    </>
  )
})

export default Spacecraft 