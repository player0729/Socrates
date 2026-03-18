import { useState, useEffect } from 'react'

const expressions = {
  default: null,
  thinking: '🤔',
  happy: '🎉',
  surprised: '😮',
}

export default function CharacterAvatar({ character, expression = 'default', size = 80 }) {
  const [currentExpression, setCurrentExpression] = useState(expression)

  useEffect(() => {
    setCurrentExpression(expression)
  }, [expression])

  const displayEmoji = expressions[currentExpression] || character?.avatar || '🎓'

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${character?.color || '#7c3aed'}22, ${character?.color || '#7c3aed'}44)`,
      border: `2px solid ${character?.color || '#7c3aed'}66`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.5,
      animation: 'pulse 3s ease-in-out infinite',
      flexShrink: 0,
    }}>
      {displayEmoji}
    </div>
  )
}
