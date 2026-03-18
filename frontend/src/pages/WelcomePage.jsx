import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function WelcomePage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: ['124,58,237', '236,72,153', '6,182,212'][Math.floor(Math.random() * 3)],
    }))

    let animId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const features = [
    { icon: '🧠', title: '记忆系统', desc: '角色记住你的学习历程，随时间建立深厚情谊' },
    { icon: '🎓', title: '苏格拉底教学', desc: '通过层层追问，引导你自主发现知识的本质' },
    { icon: '🏆', title: '游戏化成长', desc: '完成课程获得成就，见证自己从小白到大神' },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }} />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ animation: 'float 6s ease-in-out infinite', fontSize: '80px', marginBottom: '24px' }}>
          🏛️
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          letterSpacing: '-1px',
        }}>
          苏格拉底学园
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          color: '#a0a0b0',
          maxWidth: '560px',
          lineHeight: 1.6,
          marginBottom: '48px',
        }}>
          与虚拟角色对话，用苏格拉底式教学法掌握任何知识
        </p>

        <button
          onClick={() => navigate('/auth')}
          style={{
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(124,58,237,0.4)',
            transition: 'all 0.3s',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 60px rgba(124,58,237,0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 0 40px rgba(124,58,237,0.4)'
          }}
        >
          开始学习 →
        </button>

        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '80px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '900px',
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: '#1a1825',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '16px',
              padding: '28px 24px',
              width: '240px',
              textAlign: 'left',
              transition: 'all 0.3s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid rgba(124,58,237,0.6)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(124,58,237,0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#fffffe' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#a0a0b0', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '60px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          {[
            { emoji: '🌸', name: '三月七', color: '#ec4899' },
            { emoji: '⚡', name: '刻晴', color: '#7c3aed' },
            { emoji: '🌙', name: '甘雨', color: '#06b6d4' },
          ].map((c) => (
            <div key={c.name} style={{ textAlign: 'center', animation: 'float 5s ease-in-out infinite', animationDelay: `${Math.random() * 2}s` }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${c.color}22`,
                border: `2px solid ${c.color}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 8px',
              }}>{c.emoji}</div>
              <div style={{ fontSize: '13px', color: '#a0a0b0' }}>{c.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
