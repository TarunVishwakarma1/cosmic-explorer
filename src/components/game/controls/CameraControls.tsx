'use client'
import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Quaternion, Euler } from 'three'
import { SpacecraftHandles } from '../models/Spacecraft'

interface CameraControlsProps {
  spacecraftRef: React.RefObject<SpacecraftHandles | null>
  followMode?: boolean
}

export default function CameraControls({ spacecraftRef, followMode = true }: CameraControlsProps) {
  const { camera } = useThree()
  const mouseButtonDown = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const cameraRotation = useRef({ x: 0, y: 0 })
  const cameraDistance = useRef(10)
  const cameraOffset = useRef(new Vector3(0, 2, 10))
  const targetPosition = useRef(new Vector3(0, 0, 0))
  const [thirdPersonView, setThirdPersonView] = useState(followMode)
  
  // Handle mouse events for camera rotation
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        mouseButtonDown.current = true
        previousMousePosition.current = { x: e.clientX, y: e.clientY }
        e.preventDefault()
      }
    }
    
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        mouseButtonDown.current = false
      }
    }
    
    const onMouseMove = (e: MouseEvent) => {
      if (mouseButtonDown.current) {
        // Calculate mouse movement delta
        const deltaX = e.clientX - previousMousePosition.current.x
        const deltaY = e.clientY - previousMousePosition.current.y
        
        // Update camera rotation (limit vertical rotation to prevent flipping)
        cameraRotation.current.y += deltaX * 0.005
        cameraRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.current.x + deltaY * 0.005))
        
        previousMousePosition.current = { x: e.clientX, y: e.clientY }
      }
    }
    
    const onWheel = (e: WheelEvent) => {
      // Zoom in/out with mouse wheel
      cameraDistance.current = Math.max(5, Math.min(20, cameraDistance.current + e.deltaY * 0.01))
      e.preventDefault()
    }
    
    const onContextMenu = (e: MouseEvent) => {
      // Prevent context menu from appearing on right-click
      e.preventDefault()
    }
    
    // Toggle camera modes on double click
    const onDoubleClick = () => {
      setThirdPersonView(!thirdPersonView)
    }
    
    // Add event listeners
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('dblclick', onDoubleClick)
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('dblclick', onDoubleClick)
    }
  }, [])
  
  // Update camera position each frame
  useFrame(() => {
    if (!spacecraftRef.current) return
    
    // Get spacecraft position
    const spacecraftPosition = spacecraftRef.current.getPosition()
    targetPosition.current.copy(spacecraftPosition)
    
    if (thirdPersonView) {
      // Third-person mode: camera follows behind spacecraft
      
      // Calculate rotation matrix from euler angles
      const rotation = new Euler(cameraRotation.current.x, cameraRotation.current.y, 0, 'YXZ')
      const quaternion = new Quaternion().setFromEuler(rotation)
      
      // Calculate camera position based on rotation and distance
      const offset = new Vector3(0, 2, cameraDistance.current).applyQuaternion(quaternion)
      
      // Set camera position and look at target
      camera.position.lerp(spacecraftPosition.clone().add(offset), 0.1)
      camera.lookAt(targetPosition.current)
    } else {
      // Free camera mode (orbit around spacecraft)
      
      // Calculate rotation matrix from euler angles
      const rotation = new Euler(cameraRotation.current.x, cameraRotation.current.y, 0, 'YXZ')
      const quaternion = new Quaternion().setFromEuler(rotation)
      
      // Calculate camera position based on rotation and distance
      const offset = new Vector3(0, 0, cameraDistance.current).applyQuaternion(quaternion)
      
      // Smoothly update camera position
      camera.position.lerp(spacecraftPosition.clone().add(offset), 0.1)
      camera.lookAt(targetPosition.current)
    }
  })
  
  return null
} 