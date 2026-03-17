import client from './client'

export const getProfile = () => client.get('/user/profile')

export const getAchievements = () => client.get('/user/achievements')

export const getStreak = () => client.get('/user/streak')

export const updateProfile = (data) => client.put('/user/profile', data)
