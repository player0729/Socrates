import { useState, useEffect } from 'react'
import client from '../api/client'

const MOCK_ENTRIES = [
  {
    id: 1,
    characterId: 'march7',
    characterName: '三月七',
    characterAvatar: '🌸',
    characterColor: '#ec4899',
    date: '2025-01-15',
    content: '今天遇到了一个很有趣的同学！他问了我关于递归的问题，一开始我以为很简单，但他越问越深，搞得我也开始思考递归的本质了。收获不少！',
    mood: '😊',
    topic: '递归算法',
  },
  {
    id: 2,
    characterId: 'keqing',
    characterName: '刻晴',
    characterAvatar: '⚡',
    characterColor: '#7c3aed',
    date: '2025-01-14',
    content: '今日学生对线性代数的理解出现了偏差。通过连续追问，他终于意识到矩阵乘法并非简单的数乘。这就是苏格拉底式教学的意义——让他自己发现错误。',
    mood: '😤',
    topic: '线性代数',
  },
  {
    id: 3,
    characterId: 'ganyu',
    characterName: '甘雨',
    characterAvatar: '🌙',
    characterColor: '#06b6d4',
    date: '2025-01-13',
    content: '今天陪学生一步一步推导了极限的定义。他一开始很害怕，但最后终于露出了恍然大悟的神情。那一刻，真的很值得。',
    mood: '😌',
    topic: '微积分极限',
  },
]

export default function DiaryPage() {
  const [entries, setEntries] = useState(MOCK_ENTRIES)
  const [filter, setFilter] = useState('all')

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter((e) => e.characterId === filter)

  const characters = [
    { id: 'all', name: '全部', avatar: '📖' },
    { id: 'march7', name: '三月七', avatar: '🌸' },
    { id: 'keqing', name: '刻晴', avatar: '⚡' },
    { id: 'ganyu', name: '甘雨', avatar: '🌙' },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fffffe', marginBottom: '6px' }}>角色日记</h1>
        <p style={{ color: '#a0a0b0', fontSize: '14px' }}>听听导师们对每日学习的感悟</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {characters.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: filter === c.id ? 'rgba(124,58,237,0.2)' : '#1a1825',
              border: `1px solid ${filter === c.id ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
              borderRadius: '20px',
              color: filter === c.id ? '#7c3aed' : '#a0a0b0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            {c.avatar} {c.name}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #7c3aed44, transparent)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              style={{ display: 'flex', gap: '24px', animation: 'fadeSlideIn 0.4s ease' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `${entry.characterColor}22`,
                border: `2px solid ${entry.characterColor}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
                zIndex: 1,
              }}>
                {entry.characterAvatar}
              </div>

              <div style={{
                flex: 1,
                background: '#1a1825',
                border: `1px solid ${entry.characterColor}22`,
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${entry.characterColor}55`
                e.currentTarget.style.boxShadow = `0 8px 24px ${entry.characterColor}11`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = `1px solid ${entry.characterColor}22`
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 600, color: entry.characterColor }}>{entry.characterName}</span>
                    <span style={{
                      fontSize: '12px',
                      background: `${entry.characterColor}15`,
                      color: entry.characterColor,
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}>
                      {entry.topic}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{entry.mood}</span>
                    <span style={{ fontSize: '12px', color: '#606070' }}>{entry.date}</span>
                  </div>
                </div>
                <p style={{ color: '#d0d0e0', lineHeight: 1.7, fontSize: '14px' }}>
                  {entry.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#606070', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div>还没有日记条目</div>
        </div>
      )}
    </div>
  )
}
