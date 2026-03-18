import client from './client'

export const getCourses = () => client.get('/courses')

export const createCourse = (title, description) =>
  client.post('/courses', { title, description })

export const updateCourse = (id, data) =>
  client.put(`/courses/${id}`, data)

export const getCourse = (id) => client.get(`/courses/${id}`)
