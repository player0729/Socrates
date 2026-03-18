import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { getProfile, getStreak } from '../api/user'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, selectedCharacter, logout } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data)).catch(() => {})
    getStreak().then((res) => setStreak(res.data.streak || 0)).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const stats = [
    { label: '学习天数', value: streak || 7, icon: '🔥' },
    { label: '完成课程', value: 3, icon: '📚' },
    { label: '对话次数', value: 42, icon: '💬' },
    { label: '获得成就', value: 4, icon: '🏆' },
  ]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fffffe', marginBottom: '32px' }}>个人主页</h1>

      <div style={{
        background: '#1a1825',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#fffffe', marginBottom: '6px' }}>
            {user?.username || '学者'}
          </div>
          <div style={{ fontSize: '14px', color: '#a0a0b0', marginBottom: '10px' }}>
            {user?.email || '邮箱未设置'}
          </div>
          {selectedCharacter && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
            }}>
              <span style={{ fontSize: '18px' }}>{selectedCharacter.avatar}</span>
              <span style={{ fontSize: '13px', color: '#a0a0b0' }}>导师: {selectedCharacter.name}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: '#1a1825',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '14px',
            padding: '20px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fffffe', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#a0a0b0' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/characters')}
          style={{
            padding: '12px 24px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '10px',
            color: '#7c3aed',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          🔄 切换导师
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            background: 'rgba(236,72,153,0.1)',
            border: '1px solid rgba(236,72,153,0.3)',
            borderRadius: '10px',
            color: '#ec4899',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
