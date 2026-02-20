import axios from 'axios'

// In production (GitHub Pages) VITE_API_URL points to the Render backend.
// In development the Vite proxy forwards /api → localhost:8000.
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE_URL })

// Reports
export const uploadReport  = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/reports/upload', form)
}
export const getTemplates   = ()     => api.get('/reports/templates')
export const deleteTemplate = (name) => api.delete(`/reports/templates/${name}`)

// Activity
export const startMonitoring  = (interval = 5) =>
  api.post(`/activity/start?interval_seconds=${interval}`)
export const stopMonitoring   = () => api.post('/activity/stop')
export const getActivityStatus  = () => api.get('/activity/status')
export const getActivitySummary = () => api.get('/activity/summary')

// Generate
export const generateReport = (payload) => api.post('/generate/report', payload)

// Schedules
export const getSchedules    = ()     => api.get('/schedules')
export const createSchedule  = (body) => api.post('/schedules', body)
export const deleteSchedule  = (id)   => api.delete(`/schedules/${id}`)
export const toggleSchedule  = (id)   => api.patch(`/schedules/${id}/toggle`)
