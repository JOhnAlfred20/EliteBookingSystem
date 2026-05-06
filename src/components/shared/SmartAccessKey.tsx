import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from './index'

interface SmartAccessKeyProps {
  open: boolean;
  onClose: () => void;
  booking: {
    facilityName: string;
    startTime: string;
    endTime: string;
    date: string;
    id: number;
  };
}

export function SmartAccessKey({ open, onClose, booking }: SmartAccessKeyProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [scanning, setScanning] = useState(false)

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setUnlocked(false)
      setScanning(false)
    }
  }, [open])

  const handleUnlock = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setUnlocked(true)
    }, 2500)
  }

  return (
    <Modal open={open} onClose={onClose} title="Digital Access Key">
      <div className="flex flex-col items-center justify-center py-6 px-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-8 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/30">
          <span className={`w-2 h-2 rounded-full ${unlocked ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : scanning ? 'bg-primary animate-pulse' : 'bg-tertiary'}`}></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            {unlocked ? 'Access Granted' : scanning ? 'Authenticating via Secure BLE...' : 'Ready to Connect'}
          </span>
        </div>

        {/* The Lock / Key UI */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          {/* Outer pulsing rings when scanning */}
          <AnimatePresence>
            {scanning && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-primary/40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.2, 1.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                  className="absolute inset-0 rounded-full border border-primary/20"
                />
              </>
            )}
          </AnimatePresence>

          {/* Central Module */}
          <motion.div
            animate={{
              boxShadow: unlocked
                ? '0 0 40px rgba(16, 185, 129, 0.3)'
                : scanning
                ? '0 0 30px rgba(212, 175, 55, 0.4)'
                : '0 0 20px rgba(255, 255, 255, 0.05)'
            }}
            className={`w-32 h-32 rounded-full flex items-center justify-center z-10 transition-colors duration-500 border ${
              unlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface-container-highest border-outline-variant/20 shadow-xl'
            }`}
          >
            <motion.div
              animate={{ rotate: unlocked ? 360 : 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <span
                className={`material-symbols-outlined text-5xl transition-colors duration-500 ${
                  unlocked ? 'text-emerald-500' : scanning ? 'text-primary' : 'text-on-surface-variant'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {unlocked ? 'lock_open' : 'lock'}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="text-center mb-8 space-y-2">
          <h3 className="text-2xl font-black font-headline text-white">{booking.facilityName}</h3>
          <p className="text-sm font-mono text-primary bg-primary/10 inline-block px-3 py-1 rounded border border-primary/20">
            {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
          </p>
          <p className="text-xs text-on-surface-variant font-medium mt-2">
            Secure Session ID: <span className="font-mono opacity-60">ELITE-{booking.id.toString().padStart(6, '0')}</span>
          </p>
        </div>

        {/* Action Button */}
        {!unlocked ? (
          <button
            onClick={handleUnlock}
            disabled={scanning}
            className={`relative overflow-hidden w-full max-w-xs h-14 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
              scanning
                ? 'bg-surface-container-high text-primary border border-primary/30 cursor-wait'
                : 'bg-primary text-[#1a1a1a] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105'
            }`}
          >
            {scanning ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">contactless</span>
                Scanning NFC...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">key</span>
                Unlock Access
              </>
            )}
            
            {/* Shimmer effect */}
            {!scanning && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
            )}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Access Granted</p>
            <p className="text-sm font-medium">You may now enter the facility.</p>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}
