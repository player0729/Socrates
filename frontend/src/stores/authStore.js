import { create } from 'zustand'

// Initialize synchronously from localStorage to avoid flicker/redirect
function loadInitialState() {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const charStr = localStorage.getItem('selectedCharacter')
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      const selectedCharacter = charStr ? JSON.parse(charStr) : null
      return { user, token, isAuthenticated: true, selectedCharacter }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  return { user: null, token: null, isAuthenticated: false, selectedCharacter: null }
}

export const useAuthStore = create((set) => ({
  ...loadInitialState(),

  loadFromStorage: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const charStr = localStorage.getItem('selectedCharacter')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        const selectedCharacter = charStr ? JSON.parse(charStr) : null
        set({ user, token, isAuthenticated: true, selectedCharacter })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },

  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedCharacter')
    set({ user: null, token: null, isAuthenticated: false, selectedCharacter: null })
  },

  setSelectedCharacter: (character) => {
    localStorage.setItem('selectedCharacter', JSON.stringify(character))
    set({ selectedCharacter: character })
  },
}))
