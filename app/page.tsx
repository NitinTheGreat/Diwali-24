'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
// import { Volume2, VolumeX } from 'lucide-react'
// import { Button } from "@/components/ui/button"

export default function EnhancedDiwaliCelebration() {
  const [isDiyaLit, setIsDiyaLit] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fireworksIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/diwali-music1.mp3')
    audioRef.current.loop = true
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (fireworksIntervalRef.current) {
        clearInterval(fireworksIntervalRef.current)
      }
    }
  }, [])

  const lightDiya = useCallback(() => {
    if (!isDiyaLit) {
      setIsDiyaLit(true)
      startCelebration()
    }
  }, [isDiyaLit])

  const startCelebration = useCallback(() => {
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.play()
    }
    launchFireworks()
    startFirecrackerShow()
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (audioRef.current) {
        audioRef.current.muted = !prev
      }
      return !prev
    })
  }, [])

  const launchFireworks = useCallback(() => {
    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    fireworksIntervalRef.current = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        if (fireworksIntervalRef.current) {
          clearInterval(fireworksIntervalRef.current)
        }
        return
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      }))
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      }))
    }, 250)
  }, [])

  const startFirecrackerShow = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        const particles: Particle[] = []
        const particleCount = 200

        class Particle {
          x: number
          y: number
          vx: number
          vy: number
          radius: number
          color: string
          alpha: number

          constructor() {
            this.x = Math.random() * canvasRef.current!.width
            this.y = canvasRef.current!.height
            this.vx = Math.random() * 4 - 2
            this.vy = Math.random() * -10 - 5
            this.radius = Math.random() * 3 + 1
            this.color = `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
            this.alpha = 1
          }

          update() {
            this.x += this.vx
            this.y += this.vy
            this.vy += 0.1
            this.alpha -= 0.01
          }

          draw() {
            if (ctx) {
              ctx.globalAlpha = this.alpha
              ctx.fillStyle = this.color
              ctx.beginPath()
              ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }

        function createFirecracker() {
          const x = Math.random() * canvasRef.current!.width
          const y = Math.random() * canvasRef.current!.height
          for (let i = 0; i < 100; i++) {
            const particle = new Particle()
            particle.x = x
            particle.y = y
            particle.vx = Math.random() * 8 - 4
            particle.vy = Math.random() * 8 - 4
            particles.push(particle)
          }
        }

        setInterval(createFirecracker, 1000)

        function animate() {
          if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            particles.forEach((p, index) => {
              p.update()
              p.draw()
              if (p.alpha <= 0) {
                particles.splice(index, 1)
              }
            })
            requestAnimationFrame(animate)
          }
        }

        animate()
      }
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black overflow-hidden">
      <StarryBackground />
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />
      <AdditionalDiwaliItems />
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center p-4">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-amber-300 mb-8 drop-shadow-lg"
        >
          Happy Diwali!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-2xl lg:text-3xl text-amber-100 mb-12 max-w-2xl lg:max-w-4xl drop-shadow-md"
        >
          Light the diya to start the grand Diwali celebration!
        </motion.p>
        <RealisticDiya isLit={isDiyaLit} onClick={lightDiya} />
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none z-30"
            >
              <FloatingPetals />
            </motion.div>
          )}
        </AnimatePresence>
        {/* <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300 z-50"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button> */}
      </div>
      <Toran />
    </div>
  )
}

function StarryBackground() {
  return (
    <div className="absolute inset-0">
      {[...Array(200)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            opacity: Math.random(),
            animation: `twinkle ${Math.random() * 5 + 3}s linear infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}

function AdditionalDiwaliItems() {
  return (
    <>
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {i % 3 === 0 ? (
            <LanternSVG />
          ) : i % 3 === 1 ? (
            <CandleSVG />
          ) : (
            <SparklerSVG />
          )}
        </motion.div>
      ))}
    </>
  )
}

function LanternSVG() {
  return (
    <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10C31.0457 10 40 18.9543 40 30C40 41.0457 31.0457 50 20 50C8.9543 50 0 41.0457 0 30C0 18.9543 8.9543 10 20 10Z" fill="#FFD700" />
      <path d="M15 0H25V10H15V0Z" fill="#8B4513" />
      <path d="M15 50H25V60H15V50Z" fill="#8B4513" />
      <circle cx="20" cy="30" r="15" fill="#FFA500" />
    </svg>
  )
}

function CandleSVG() {
  return (
    <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="10" height="30" fill="#F4A460" />
      <path d="M10 0L15 10H5L10 0Z" fill="#FF4500" />
      <circle cx="10" cy="5" r="3" fill="#FFD700" />
    </svg>
  )
}

function SparklerSVG() {
  return (
    <svg width="30" height="60" viewBox="0 0 30 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="30" width="4" height="30" fill="#8B4513" />
      <circle cx="15" cy="15" r="15" fill="#FFD700" />
      <path d="M15 0L20 10H10L15 0Z" fill="#FF4500" />
      <path d="M15 20L20 30H10L15 20Z" fill="#FF4500" />
      <path d="M5 15L15 20L5 25L5 15Z" fill="#FF4500" />
      <path d="M25 15L15 20L25 25L25 15Z" fill="#FF4500" />
    </svg>
  )
}

function RealisticDiya({ isLit, onClick }: { isLit: boolean; onClick: () => void }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Click to light the diya"
    >
      <defs>
        <radialGradient id="flameGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF4500" />
        </radialGradient>
      </defs>
      <path d="M20,80 Q50,60 80,80 L90,90 Q50,100 10,90 Z" fill="#CD7F32" />
      <ellipse cx="50" cy="75" rx="25" ry="10" fill="#8B4513" />
      {isLit && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ellipse cx="50" cy="60" rx="15" ry="25" fill="url(#flameGradient)" />
          <motion.ellipse
            cx="50"
            cy="60"
            rx="10"
            ry="20"
            
            fill="#FFA500"
            animate={{
              ry: [20, 25, 20],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>
      )}
    </motion.svg>
  )
}

function FloatingPetals() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-pink-400 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random(),
          }}
          animate={{
            translateY: ["0%", "-100%"],
            translateX: [`${Math.random() * 20 - 10}%`, `${Math.random() * 20 - 10}%`],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  )
}

function Toran() {
  return (
    <div className="absolute top-0 left-0 w-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100" className="w-full">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FF6347", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path d="M0,0 Q250,100 500,0" stroke="url(#gradient)" strokeWidth="10" fill="none" />
        <g fill="#FFD700">
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={50 + i * 45} cy={Math.sin(i * 0.6) * 20 + 50} r="5">
              <animate
                attributeName="cy"
                values={`${Math.sin(i * 0.6) * 20 + 50};${Math.sin(i * 0.6 + Math.PI) * 20 + 50};${Math.sin(i * 0.6) * 20 + 50}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  )
}