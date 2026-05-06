import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// 1. Custom Cursor
export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, [role="button"]')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }
    window.addEventListener('mousemove', moveMouse)
    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      window.removeEventListener('mousemove', moveMouse)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  const ringX = useSpring(mousePos.x, { damping: 20, stiffness: 100 })
  const ringY = useSpring(mousePos.y, { damping: 20, stiffness: 100 })

  return (
    <>
      {/* Central Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] shadow-[0_0_15px_rgba(68,221,193,0.8)]"
        animate={{
          x: mousePos.x - 6,
          y: mousePos.y - 6,
          scale: isHovering ? 3.5 : 1,
          opacity: isHovering ? 0.4 : 1
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      {/* Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-9 h-9 border border-primary/30 rounded-full pointer-events-none z-[9998]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  )
}

// 2. Scroll Progress Bar
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-tertiary origin-left z-[10000] shadow-[0_2px_10px_rgba(68,221,193,0.3)]"
      style={{ scaleX }}
    />
  )
}

// 3. Hero Object (Persistent Floating Element)
export function HeroObject() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // Spring physics for target position
  const x = useSpring(200, { damping: 15, stiffness: 50 })
  const y = useSpring(200, { damping: 15, stiffness: 50 })

  useEffect(() => {
    // Target moves based on section (simulated)
    const interval = setInterval(() => {
      const targetX = Math.random() * window.innerWidth
      const targetY = Math.random() * window.innerHeight * 0.5
      x.set(targetX)
      y.set(targetY)
    }, 4000)
    return () => clearInterval(interval)
  }, [x, y])

  // Repel effect
  const dx = x.get() - mousePos.x
  const dy = y.get() - mousePos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const repelForce = dist < 200 ? (200 - dist) / 2 : 0
  const angle = Math.atan2(dy, dx)

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      animate={{
        x: x.get() + Math.cos(angle) * repelForce,
        y: y.get() + Math.sin(angle) * repelForce,
      }}
    >
      <div className="w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute inset-0 m-auto w-32 h-32 bg-primary/5 rounded-full blur-[60px]" />
    </motion.div>
  )
}

// 4. Click Ripple Effect
export function RippleEffect() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = Date.now()
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id))
      }, 600)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[10001] overflow-hidden">
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              borderRadius: '50%',
              backgroundColor: 'rgba(68, 221, 193, 0.4)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// 5. Background Particles
export function BackgroundParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {Array.from({ length: 25 }).map((_, i) => {
        const size = Math.random() * 3 + 2
        return (
          <motion.div
            key={i}
            initial={{ 
              y: '110vh', 
              x: `${Math.random() * 100}vw`,
              opacity: 0 
            }}
            animate={{ 
              y: '-10vh',
              x: `${(Math.random() * 100) + (Math.random() * 10 - 5)}vw`,
              opacity: [0, 0.3, 0.3, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 10
            }}
            className="absolute rounded-full bg-primary/30"
            style={{ width: size, height: size }}
          />
        )
      })}
    </div>
  )
}

// 6. Atmospheric Beams (Stadium lights)
export function StadiumBeams() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden opacity-20">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-[-100px] w-[2px] h-[600px] bg-gradient-to-b from-primary via-primary/5 to-transparent"
          initial={{ x: `${i * 15}%`, rotate: -15 }}
          animate={{ rotate: [ -15, 15, -15 ] }}
          transition={{ 
            duration: 10 + i, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: i * 1.5 
          }}
          style={{ transformOrigin: 'top center' }}
        />
      ))}
    </div>
  )
}
