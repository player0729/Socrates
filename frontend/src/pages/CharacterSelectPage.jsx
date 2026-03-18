import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { selectCharacter } from '../api/characters'
import toast from 'react-hot-toast'

const CHARACTERS = [
  {
    id: 'march7',
    name: '三月七',
    avatar: '🌸',
    tag: '活泼·元气',
    description: '清华计算机系大一学生，喜欢用生活比喻教学，让你在欢笑中掌握知识',
    traits: ['比喻教学', '轻松氛围', '超有活力'],
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec489922, #f4729422)',
    border: 'rgba(236,72,153,',
    subject: '适合：编程、数学、物理',
  },
  {
    id: 'keqing',
    name: '刻晴',
    avatar: '⚡',
    tag: '严谨·高效',
    description: '逻辑清晰的学霸，追问层层深入，帮你真正理解知识的本质',
    traits: ['逻辑严密', '层层追问', '高效学习'],
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed22, #9333ea22)',
    border: 'rgba(124,58,237,',
    subject: '适合：数学、逻辑、哲学',
  },
  {
    id: 'ganyu',
    name: '甘雨',
    avatar: '🌙',
    tag: '温柔·耐心',
    description: '数学天才，耐心陪你慢慢理解，不会评判你的任何问题',
    traits: ['耐心细致', '温柔引导', '零基础友好'],
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d422, #0891b222)',
    border: 'rgba(6,182,212,',
    subject: '适合：所有学科，零基础推荐',
  },
]

export default function CharacterSelectPage() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setSelectedCharacter } = useAuthStore()
  const navigate = useNavigate()

  const handleConfirm = async () => {
    if (!selected) return
    setLoading(true)
    const char = CHARACTERS.find((c) => c.id === selected)
    try {
      await selectCharacter(selected)
    } catch {}
    setSelectedCharacter(char)
    toast.success(`${char.name} 已成为你的专属导师！`)
    setTimeout(() => navigate('/chat'), 800)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e17',
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'fixed',
        width: '800px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', marginBottom: '16px', animation: 'fadeSlideIn 0.5s ease' }}>
        <div style={{ fontSize: '14px', color: '#7c3aed', fontWeight: 600, letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>
          Choose Your Mentor
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
        }}>
          选择你的专属导师
        </h1>
        <p style={{ color: '#a0a0b0', fontSize: '16px', maxWidth: '500px' }}>
          每位导师都有独特的教学风格，选择最适合你的那一位
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '40px 0',
      }}>
        {CHARACTERS.map((char, idx) => {
          const isSelected = selected === char.id
          return (
            <div
              key={char.id}
              onClick={() => setSelected(char.id)}
              style={{
                background: isSelected ? char.gradient : '#1a1825',
                border: `2px solid ${char.border}${isSelected ? '0.8' : '0.2'})`,
                borderRadius: '20px',
                padding: '32px 24px',
                width: '280px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isSelected ? `0 20px 60px ${char.border}0.2)` : 'none',
                position: 'relative',
                animation: `fadeSlideIn 0.5s ease ${idx * 0.1}s both`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.border = `2px solid ${char.border}0.5)`
                  e.currentTarget.style.boxShadow = `0 12px 40px ${char.border}0.1)`
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.border = `2px solid ${char.border}0.2)`
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: char.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}>✓</div>
              )}

              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `${char.color}22`,
                border: `3px solid ${char.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                margin: '0 auto 20px',
                boxShadow: isSelected ? `0 0 30px ${char.color}44` : 'none',
                transition: 'all 0.3s',
                animation: isSelected ? 'pulse 2s ease-in-out infinite' : 'none',
              }}>
                {char.avatar}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fffffe', marginBottom: '6px' }}>
                  {char.name}
                </h2>
                <span style={{
                  background: `${char.color}22`,
                  color: char.color,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}>
                  {char.tag}
                </span>
              </div>

              <p style={{
                color: '#a0a0b0',
                fontSize: '14px',
                lineHeight: 1.6,
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                {char.description}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                {char.traits.map((t) => (
                  <span key={t} style={{
                    background: `${char.color}15`,
                    border: `1px solid ${char.color}30`,
                    color: char.color,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}>{t}</span>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '12px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#606070',
              }}>
                {char.subject}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || loading}
        style={{
          padding: '16px 64px',
          fontSize: '18px',
          fontWeight: 600,
          background: selected ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : '#2a2838',
          color: selected ? 'white' : '#606070',
          border: 'none',
          borderRadius: '50px',
          cursor: selected ? 'pointer' : 'not-allowed',
          boxShadow: selected ? '0 0 40px rgba(124,58,237,0.3)' : 'none',
          transition: 'all 0.3s',
          marginBottom: '20px',
        }}
      >
        {loading ? '正在进入...' : selected ? `与${CHARACTERS.find(c => c.id === selected)?.name}开始学习 →` : '请选择一位导师'}
      </button>

      <p style={{ color: '#606070', fontSize: '13px' }}>
        之后可以在设置中更换导师
      </p>
    </div>
  )
}
