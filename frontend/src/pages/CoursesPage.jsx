import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, createCourse } from '../api/courses'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import { Plus, BookOpen, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)
  const { setCourse } = useChatStore()
  const { selectedCharacter } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await getCourses()
      setCourses(res.data.courses || res.data || [])
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      const res = await createCourse(form.title, form.description)
      setCourses((prev) => [...prev, res.data.course || res.data])
      setForm({ title: '', description: '' })
      setShowForm(false)
      toast.success('课程创建成功！')
    } catch {
      toast.error('创建失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  const handleStudy = (course) => {
    setCourse(course)
    navigate('/chat')
  }

  const mockCourses = courses.length > 0 ? courses : [
    { id: 1, title: '微积分入门', description: '从极限到积分，系统掌握微积分', progress: 35, emoji: '📐' },
    { id: 2, title: 'Python 编程', description: '面向对象与函数式编程范式', progress: 60, emoji: '🐍' },
    { id: 3, title: '线性代数', description: '向量空间与矩阵变换的直觉理解', progress: 15, emoji: '📊' },
  ]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fffffe', marginBottom: '6px' }}>我的课程</h1>
          <p style={{ color: '#a0a0b0', fontSize: '14px' }}>与{selectedCharacter?.name || '导师'}一起，系统学习每一个主题</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          新建课程
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#1a1825',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          animation: 'fadeSlideIn 0.3s ease',
        }}>
          <h3 style={{ color: '#fffffe', marginBottom: '16px', fontSize: '16px' }}>创建新课程</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="课程名称（如：微积分入门）"
              required
              style={{
                background: '#0f0e17',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fffffe',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="课程描述（可选）"
              rows={2}
              style={{
                background: '#0f0e17',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fffffe',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {creating ? '创建中...' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 24px',
                  background: '#2a2838',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#a0a0b0', padding: '60px' }}>加载中...</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {mockCourses.map((course) => (
            <div
              key={course.id}
              style={{
                background: '#1a1825',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(124,58,237,0.5)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(124,58,237,0.2)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'rgba(124,58,237,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0,
              }}>
                {course.emoji || '📚'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fffffe', marginBottom: '4px' }}>
                  {course.title}
                </div>
                <div style={{ fontSize: '13px', color: '#a0a0b0', marginBottom: '8px' }}>
                  {course.description}
                </div>
                <div style={{
                  height: '4px',
                  background: '#2a2838',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  width: '200px',
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    borderRadius: '2px',
                    width: `${course.progress || 0}%`,
                  }} />
                </div>
                <div style={{ fontSize: '11px', color: '#606070', marginTop: '4px' }}>
                  进度 {course.progress || 0}%
                </div>
              </div>
              <button
                onClick={() => handleStudy(course)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '10px',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
              >
                <BookOpen size={14} />
                开始学习
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
