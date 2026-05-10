import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const uploadJD = (title, file) => {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  return api.post('/jd/upload', form)
}

export const listJDs = () => api.get('/jd/list')

export const uploadResumes = (jdId, files) => {
  const form = new FormData()
  form.append('jd_id', jdId)
  files.forEach(f => form.append('files', f))
  return api.post('/resume/upload', form, { timeout: 180000 })
}

export const getResults = (jdId) => api.get(`/screening/results/${jdId}`)

export const overrideCandidate = (id, body) =>
  api.post(`/screening/override/${id}`, body)

export const deleteCandidate = (id) =>
  api.delete(`/screening/candidate/${id}`)