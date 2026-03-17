import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Send, BookOpen, LogOut, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const CHARACTERS_META = {
  march7: { name: '三月七', avatar: '🌸', color: '#ec4899', stage: '初识', mood: '😊 元气满满' },
  keqing: { name: '刻晴', avatar: '⚡', color: '#7c3aed', stage: '初识', mood: '😤 认真模式' },
  ganyu: { name: '甘雨', avatar: '🌙', color: '#06b6d4', stage: '初识', mood: '😌 温柔状态' },
}

const WELCOME_MESSAGES = {
  march7: '哇！你来啦！✨ 我是三月七，超级开心认识你！你今天想学什么呢？不管是什么，我都会用最有趣的方式教你的～',
  keqing: '你好。我是刻晴。学习不是儿戏，我希望你做好准备接受真正的挑战。说说看，你想深入理解哪个领域？',
  ganyu: '你好呀...我是甘雨。没关系，不管你的基础如何，我们都可以慢慢来。请告诉我，你想学什么呢？',
}

function TypingIndicator({ character }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', padding: '8px 0' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: `${character?.color || '#7c3aed'}22`,
        border: `2px solid ${character?.color || '#7c3aed'}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
      }}>
        {character?.avatar || '🎓'}
      </div>
      <div style={{
        background: '#1a1825',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '18px 18px 18px 4px',
        padding: '14px 18px',
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: character?.color || '#7c3aed',
            animation: `typing 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ msg, character }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '12px',
      alignItems: 'flex-end',
      padding: '4px 0',
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: `${character?.color || '#7c3aed'}22`,
          border: `2px solid ${character?.color || '#7c3aed'}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}>
          {character?.avatar || '🎓'}
        </div>
      )}
      <div style={{ maxWidth: '65%' }}>
        {!isUser && (
          <div style={{ fontSize: '12px', color: '#606070', marginBottom: '4px', paddingLeft: '4px' }}>
            {character?.name}
          </div>
        )}
        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
            : '#1a1825',
          border: isUser ? 'none' : '1px solid rgba(124,58,237,0.2)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          color: '#fffffe',
          fontSize: '15px',
          lineHeight: 1.6,
        }}>
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#404050',
          marginTop: '4px',
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : '4px',
          paddingRight: isUser ? '4px' : 0,
        }}>
          {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [studyTime, setStudyTime] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { selectedCharacter } = useAuthStore()
  const { messages, isLoading, sendMessage, endSession, clearMessages, setCharacter } = useChatStore()

  const charMeta = selectedCharacter
    ? CHARACTERS_META[selectedCharacter.id] || selectedCharacter
    : null

  useEffect(() => {
    if (!selectedCharacter) {
      navigate('/characters')
      return
    }
    setCharacter(selectedCharacter)
    if (messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        role: 'assistant',
        content: WELCOME_MESSAGES[selectedCharacter.id] || `你好！我是${selectedCharacter.name}，让我们开始学习吧！`,
        timestamp: new Date().toISOString(),
        character: selectedCharacter,
      }
      useChatStore.setState((s) => ({ messages: [welcomeMsg] }))
    }
  }, [selectedCharacter])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const timer = setInterval(() => setStudyTime((t) => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage(text)
    inputRef.current?.focus()
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  const handleEndSession = async () => {
    await endSession()
    toast.success('下课啦，今日辛苦！')
    navigate('/courses')
  }

  if (!selectedCharacter) return null

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: '#0f0e17' }}>
      <div style={{
        width: '220px',
        background: '#1a1825',
        borderRight: '1px solid rgba(124,58,237,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 16px',
        gap: '16px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `${charMeta?.color || '#7c3aed'}22`,
          border: `3px solid ${charMeta?.color || '#7c3aed'}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '52px',
          animation: 'pulse 3s ease-in-out infinite',
          boxShadow: `0 0 30px ${charMeta?.color || '#7c3aed'}22`,
        }}>
          {charMeta?.avatar || '🎓'}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fffffe' }}>
            {charMeta?.name || selectedCharacter.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: charMeta?.color || '#7c3aed',
            background: `${charMeta?.color || '#7c3aed'}18`,
            padding: '3px 10px',
            borderRadius: '12px',
            marginTop: '6px',
            display: 'inline-block',
          }}>
            {charMeta?.stage || '初识'}
          </div>
        </div>

        <div style={{
          background: '#0f0e17',
          borderRadius: '10px',
          padding: '10px 14px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#606070', marginBottom: '4px' }}>当前心情</div>
          <div style={{ fontSize: '14px', color: '#a0a0b0' }}>{charMeta?.mood}</div>
        </div>

        <div style={{
          background: '#0f0e17',
          borderRadius: '10px',
          padding: '10px 14px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Clock size={14} style={{ color: '#7c3aed' }} />
          <div>
            <div style={{ fontSize: '11px', color: '#606070' }}>今日学习</div>
            <div style={{ fontSize: '14px', color: '#a0a0b0' }}>{studyTime} 分钟</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleEndSession}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(236,72,153,0.1)',
            border: '1px solid rgba(236,72,153,0.3)',
            borderRadius: '10px',
            color: '#ec4899',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(236,72,153,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(236,72,153,0.1)'}
        >
          <LogOut size={16} />
          下课
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} character={charMeta} />
          ))}
          {isLoading && <TypingIndicator character={charMeta} />}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          background: '#1a1825',
          borderTop: '1px solid rgba(124,58,237,0.2)',
          padding: '16px 24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <div style={{ fontSize: '28px', flexShrink: 0, marginBottom: '4px' }}>
            {charMeta?.avatar || '🎓'}
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`向${charMeta?.name || '导师'}提问... (Ctrl+Enter 发送)`}
            rows={3}
            style={{
              flex: 1,
              background: '#0f0e17',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#fffffe',
              fontSize: '15px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.3)'}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                : '#2a2838',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
              boxShadow: input.trim() && !isLoading ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            <Send size={20} color={input.trim() && !isLoading ? 'white' : '#606070'} />
          </button>
        </div>

        <div style={{
          background: '#1a1825',
          borderTop: '1px solid rgba(124,58,237,0.1)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <BookOpen size={14} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: '13px', color: '#606070' }}>
            当前未选择课程 —
          </span>
          <button
            onClick={() => navigate('/courses')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              cursor: 'pointer',
              fontSize: '13px',
              padding: 0,
            }}
          >
            选择课程
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate('/diary')}
            style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
              color: '#06b6d4',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '8px',
            }}
          >
            📖 查看日记
          </button>
        </div>
      </div>
    </div>
  )
}
