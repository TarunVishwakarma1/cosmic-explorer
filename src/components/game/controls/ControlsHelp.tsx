'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ControlsHelp() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed top-4 left-4 z-50">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          <path d="M13.8 13.8 18 18"></path>
        </svg>
        {expanded ? 'Hide Controls' : 'Controls'}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-4 bg-black/80 backdrop-blur-md text-white rounded-lg border border-white/20 shadow-xl w-80"
          >
            <h3 className="text-xl font-bold mb-3">Keyboard Controls</h3>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <span>Forward/Backward:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">W, S or ↑, ↓</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Left/Right:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">A, D or ←, →</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Up/Down:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">Q, E</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Boost:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">Shift</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Shield:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">1</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Speed Boost:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">2</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Weapon Boost:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">3</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Fuel Recharge:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">4</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3">Camera Controls</h3>
            
            <div className="space-y-2 border-l-2 border-blue-500 pl-3">
              <div className="flex justify-between items-center">
                <span>Rotate Camera:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">Right-Click + Drag</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Zoom In/Out:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">Scroll Wheel</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Toggle View Mode:</span>
                <span className="text-gray-300 bg-black/40 px-2 py-1 rounded">Double-Click</span>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400 bg-blue-900/20 p-2 rounded border border-blue-500/30">
              <strong>Pro Tip:</strong> The spacecraft moves relative to the camera view. Rotate your camera with right-click to change your direction of travel. Movement will always be forward/backward/left/right relative to your current camera view.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 