import client from './client'

export const sendMessage = (message, characterId, courseId, sessionId) =>
  client.post('/chat/message', { message, characterId, courseId, sessionId })

export const endSession = (sessionId) =>
  client.post(`/chat/session/${sessionId}/end`)

export const getHistory = (sessionId) =>
  client.get(`/chat/session/${sessionId}/history`)

export const getSessions = () => client.get('/chat/sessions')
