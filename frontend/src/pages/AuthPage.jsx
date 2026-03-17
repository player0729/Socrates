import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { login, register } from '../api/auth'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login: storeLogin, selectedCharacter } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (isLogin) {
        res = await login(form.email, form.password)
      } else {
        res = await register(form.username, form.email, form.password)
      }
      const { user, token } = res.data
      storeLogin(user, token)
      toast.success(isLogin ? '登录成功！' : '注册成功！')
      if (!selectedCharacter) {
        navigate('/characters')
      } else {
        navigate('/chat')
      }
    } catch (err) {
      const msg = err.response?.data?.message || (isLogin ? '登录失败' : '注册失败')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#0f0e17',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '10px',
    color: '#fffffe',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0e17',
      padding: '20px',
    }}>
      <div style={{
        position: 'fixed',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#1a1825',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        animation: 'fadeSlideIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
          }}>
            苏格拉底学园
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: '14px' }}>
            {isLogin ? '欢迎回来，学者' : '加入我们，开始学习之旅'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          background: '#0f0e17',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '28px',
        }}>
          {['登录', '注册'].map((label, i) => (
            <button
              key={label}
              onClick={() => setIsLogin(i === 0)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: (i === 0) === isLogin ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'transparent',
                color: (i === 0) === isLogin ? 'white' : '#a0a0b0',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '13px', color: '#a0a0b0', marginBottom: '6px', display: 'block' }}>用户名</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="输入用户名"
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.3)'}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', color: '#a0a0b0', marginBottom: '6px', display: 'block' }}>邮箱</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="输入邮箱"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.3)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#a0a0b0', marginBottom: '6px', display: 'block' }}>密码</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="输入密码"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.3)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#333' : 'linear-gradient(135deg, #7c3aed, #ec4899)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>
      </div>
    </div>
  )
}
