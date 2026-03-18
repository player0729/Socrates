import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { MessageCircle, BookOpen, Trophy, BookMarked, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout, selectedCharacter } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const navItems = [
    { path: '/chat', label: '聊天', icon: MessageCircle },
    { path: '/courses', label: '课程', icon: BookOpen },
    { path: '/achievements', label: '成就', icon: Trophy },
    { path: '/diary', label: '日记', icon: BookMarked },
    { path: '/profile', label: '个人', icon: User },
  ]

  return (
    <nav style={{
      background: '#1a1825',
      borderBottom: '1px solid rgba(124,58,237,0.3)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/chat" style={{ textDecoration: 'none' }}>
        <span style={{
          fontSize: '20px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>苏格拉底学园</span>
      </Link>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: location.pathname === path ? '#7c3aed' : '#a0a0b0',
              background: location.pathname === path ? 'rgba(124,58,237,0.15)' : 'transparent',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {selectedCharacter && (
          <span style={{
            fontSize: '13px',
            color: '#a0a0b0',
            background: 'rgba(124,58,237,0.1)',
            padding: '4px 10px',
            borderRadius: '20px',
          }}>
            {selectedCharacter.avatar} {selectedCharacter.name}
          </span>
        )}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0a0b0',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="退出登录"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
