import client from './client'

export const getCharacters = () => client.get('/characters')

export const selectCharacter = (characterId) =>
  client.post('/characters/select', { characterId })

export const getCharacterMemory = (characterId) =>
  client.get(`/characters/${characterId}/memory`)
