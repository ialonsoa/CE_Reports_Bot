import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Reports
export const uploadReport = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/reports/upload', form)
}

export const getTemplates = () => api.get('/reports/templates')

export const deleteTemplate = (name) => api.delete(`/reports/templates/${name}`)

// Activity
export const startMonitoring = (interval = 5) =>
  api.post(`/activity/start?interval_seconds=${interval}`)

export const stopMonitoring = () => api.post('/activity/stop')

export const getActivityStatus = () => api.get('/activity/status')

export const getActivitySummary = () => api.get('/activity/summary')

// Generate
export const generateReport = (payload) => api.post('/generate/report', payload)
