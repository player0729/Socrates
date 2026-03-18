import { useState, useEffect } from 'react'
import { getAchievements } from '../api/user'

const DEFAULT_ACHIEVEMENTS = [
  { id: 1, title: '初学乍练', desc: '完成第一次对话', icon: '🌱', unlocked: true, rarity: '普通' },
  { id: 2, title: '求知若渴', desc: '连续学习 7 天', icon: '🔥', unlocked: true, rarity: '稀有' },
  { id: 3, title: '深度探索', desc: '与同一角色对话 100 次', icon: '🔍', unlocked: false, rarity: '稀有' },
  { id: 4, title: '知己之交', desc: '达成与角色的最高信任度', icon: '💎', unlocked: false, rarity: '史诗' },
  { id: 5, title: '博学多才', desc: '完成 5 门不同课程', icon: '📚', unlocked: false, rarity: '传说' },
  { id: 6, title: '苏格拉底之徒', desc: '通过苏格拉底式问答解决一个复杂问题', icon: '🏛️', unlocked: true, rarity: '史诗' },
  { id: 7, title: '破晓时分', desc: '深夜 12 点后还在学习', icon: '🌙', unlocked: true, rarity: '普通' },
  { id: 8, title: '完美主义', desc: '在一次对话中提出 20 个问题', icon: '⭐', unlocked: false, rarity: '稀有' },
]

const RARITY_COLORS = {
  普通: '#a0a0b0',
  稀有: '#06b6d4',
  史诗: '#7c3aed',
  传说: '#ec4899',
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS)

  useEffect(() => {
    getAchievements()
      .then((res) => setAchievements(res.data.achievements || DEFAULT_ACHIEVEMENTS))
      .catch(() => {})
  }, [])

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fffffe', marginBottom: '6px' }}>成就</h1>
        <p style={{ color: '#a0a0b0', fontSize: '14px' }}>
          已解锁 {unlocked.length}/{achievements.length} 个成就
        </p>
        <div style={{
          height: '6px',
          background: '#2a2838',
          borderRadius: '3px',
          overflow: 'hidden',
          width: '200px',
          marginTop: '10px',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            width: `${(unlocked.length / achievements.length) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#7c3aed', marginBottom: '16px' }}>
        ✨ 已解锁
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {unlocked.map((a) => (
          <div
            key={a.id}
            style={{
              background: '#1a1825',
              border: `1px solid ${RARITY_COLORS[a.rarity]}44`,
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 8px 24px ${RARITY_COLORS[a.rarity]}22`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>{a.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fffffe', marginBottom: '4px' }}>{a.title}</div>
            <div style={{ fontSize: '12px', color: '#a0a0b0', marginBottom: '8px', lineHeight: 1.4 }}>{a.desc}</div>
            <span style={{
              fontSize: '11px',
              color: RARITY_COLORS[a.rarity],
              background: `${RARITY_COLORS[a.rarity]}15`,
              padding: '2px 8px',
              borderRadius: '8px',
            }}>{a.rarity}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#606070', marginBottom: '16px' }}>
        🔒 未解锁
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {locked.map((a) => (
          <div
            key={a.id}
            style={{
              background: '#1a1825',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              opacity: 0.5,
              filter: 'grayscale(0.8)',
            }}
          >
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>{a.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fffffe', marginBottom: '4px' }}>{a.title}</div>
            <div style={{ fontSize: '12px', color: '#a0a0b0', marginBottom: '8px', lineHeight: 1.4 }}>{a.desc}</div>
            <span style={{
              fontSize: '11px',
              color: RARITY_COLORS[a.rarity],
              background: `${RARITY_COLORS[a.rarity]}15`,
              padding: '2px 8px',
              borderRadius: '8px',
            }}>{a.rarity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
