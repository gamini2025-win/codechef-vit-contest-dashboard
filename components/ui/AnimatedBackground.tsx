'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import gsap from 'gsap'

// ─── HLS Video Background ────────────────────────────────────────────────────

const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({ autoStartLoad: true, startLevel: -1 })
      hls.loadSource(HLS_SRC)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_SRC
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {})
      })
    }

    return () => {
      hls?.destroy()
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      />
      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Radial spotlight — dims edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(10,10,15,0.7) 100%)',
        }}
      />
      {/* Bottom fade into page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </div>
  )
}

// ─── Halftone Dot Grid ────────────────────────────────────────────────────────

function HalftoneDotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(232,69,69,0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage:
          'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)',
      }}
    />
  )
}

// ─── GSAP Particle Field ─────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const NUM = 55
    const MAX_DIST = 140
    const particles: Particle[] = []
    let animId: number
    let mouse = { x: -999, y: -999 }

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-clamp positions after resize
      particles.forEach((p) => {
        p.x = Math.min(p.x, canvas.width)
        p.y = Math.min(p.y, canvas.height)
      })
    }

    function init() {
      if (!canvas) return
      for (let i = 0; i < NUM; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.8 + 0.6,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22
            ctx.strokeStyle = `rgba(232,69,69,${alpha})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Mouse-proximity glow connections
      particles.forEach((p) => {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 120) {
          const a = (1 - d / 120) * 0.5
          ctx.strokeStyle = `rgba(255,120,120,${a})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      })

      // Dots
      particles.forEach((p) => {
        // Outer glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        grd.addColorStop(0, `rgba(232,69,69,${p.opacity * 0.6})`)
        grd.addColorStop(1, 'rgba(232,69,69,0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,69,69,${p.opacity})`
        ctx.fill()
      })

      // Move
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      mouse = { x: e.clientX, y: e.clientY }
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)

    // GSAP entrance: fade in from 0
    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power2.out' })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0 }}
    />
  )
}

// ─── Floating Orbs ────────────────────────────────────────────────────────────

const ORB_CONFIG = [
  { size: 420, x: '8%',  y: '10%', dur: 22, delay: 0,   color: 'rgba(232,69,69,0.06)' },
  { size: 280, x: '75%', y: '5%',  dur: 18, delay: 3,   color: 'rgba(232,69,69,0.04)' },
  { size: 340, x: '60%', y: '55%', dur: 26, delay: 6,   color: 'rgba(180,40,40,0.05)' },
  { size: 200, x: '20%', y: '70%', dur: 14, delay: 1.5, color: 'rgba(255,100,100,0.04)' },
]

function FloatingOrbs() {
  const orbRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    orbRefs.current.forEach((orb, i) => {
      if (!orb) return
      const cfg = ORB_CONFIG[i]
      gsap.fromTo(
        orb,
        { y: 0, x: 0, scale: 1 },
        {
          y: `${20 + i * 8}`,
          x: `${-15 + i * 6}`,
          scale: 1.08,
          duration: cfg.dur,
          delay: cfg.delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        }
      )
    })
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ORB_CONFIG.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => { orbRefs.current[i] = el }}
          className="absolute rounded-full"
          style={{
            width: cfg.size,
            height: cfg.size,
            left: cfg.x,
            top: cfg.y,
            background: `radial-gradient(circle at 40% 40%, ${cfg.color}, transparent 70%)`,
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Scan Lines ───────────────────────────────────────────────────────────────

function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        opacity: 0.6,
      }}
    />
  )
}

// ─── Noise Texture ────────────────────────────────────────────────────────────

function NoiseTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
      }}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0f]">
      <VideoBackground />
      <FloatingOrbs />
      <HalftoneDotGrid />
      <ParticleCanvas />
      <ScanLines />
      <NoiseTexture />
    </div>
  )
}

// FloatingShapes kept for backwards-compat (now a no-op — orbs replace it)
export function FloatingShapes() {
  return null
}
