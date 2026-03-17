import { create } from 'zustand'
import * as chatApi from '../api/chat'

export const useChatStore = create((set, get) => ({
  messages: [],
  currentSession: null,
  selectedCharacter: null,
  currentCourse: null,
  isLoading: false,

  setCharacter: (character) => set({ selectedCharacter: character }),
  setCourse: (course) => set({ currentCourse: course }),
  setSession: (session) => set({ currentSession: session }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (text) => {
    const { selectedCharacter, currentCourse, currentSession } = get()
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }))

    try {
      const response = await chatApi.sendMessage(
        text,
        selectedCharacter?.id,
        currentCourse?.id,
        currentSession
      )
      const data = response.data
      const assistantMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role: 'assistant',
        content: data.message || data.response || '',
        timestamp: new Date().toISOString(),
        character: selectedCharacter,
      }
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        currentSession: data.sessionId || state.currentSession,
      }))
    } catch (error) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            role: 'assistant',
            content: '抱歉，我暂时无法回应，请稍后再试。',
            timestamp: new Date().toISOString(),
            character: selectedCharacter,
            isError: true,
          },
        ],
        isLoading: false,
      }))
    }
  },

  endSession: async () => {
    const { currentSession } = get()
    if (currentSession) {
      try {
        await chatApi.endSession(currentSession)
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }
    set({ messages: [], currentSession: null })
  },

  loadHistory: async (sessionId) => {
    try {
      const response = await chatApi.getHistory(sessionId)
      set({ messages: response.data.messages || [], currentSession: sessionId })
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  },
}))
