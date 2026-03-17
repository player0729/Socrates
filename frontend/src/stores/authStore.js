import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  selectedCharacter: null,

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
