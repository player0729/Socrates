import client from './client'

export const sendMessage = (message, characterId, courseId, sessionId) =>
  client.post('/chat/send', { message, characterId, courseId, sessionId })

export const endSession = (sessionId) =>
  client.post('/chat/end-session', { sessionId })

export const getHistory = (sessionId) =>
  client.get(`/chat/history/${sessionId}`)

export const getSessions = () => client.get('/chat/sessions')
