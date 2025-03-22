'use client'
import { useEffect, useState } from 'react'

export default function MobileControls() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile or small screen
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  // Show message for mobile devices
  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-white">Please try this game on laptop or PC</h2>
        </div>
      </div>
    )
  }

  return null
} 