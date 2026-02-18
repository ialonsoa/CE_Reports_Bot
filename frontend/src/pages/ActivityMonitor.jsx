import { useEffect, useState } from 'react'
import { Play, Square, RefreshCw, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import { startMonitoring, stopMonitoring, getActivityStatus } from '../services/api'

export default function ActivityMonitor() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadStatus = () =>
    getActivityStatus().then(r => setStatus(r.data)).catch(() => {})

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      await startMonitoring(5)
      toast.success('Activity monitoring started!')
      loadStatus()
    } catch {
      toast.error('Failed to start monitoring')
    }
    setLoading(false)
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await stopMonitoring()
      toast.success('Monitoring stopped')
      loadStatus()
    } catch {
      toast.error('Failed to stop monitoring')
    }
    setLoading(false)
  }

  const isRunning = status?.is_running
  const summary = status?.summary || {}
  const topApps = summary.top_apps || []
  const totalMin = Math.round((summary.total_tracked_seconds || 0) / 60)

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Activity Monitor</h2>
      <p className="text-gray-500 mb-6">
        Track which apps you use throughout the day. This data helps the AI understand your workflow when generating reports.
      </p>

      {/* Status card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <div>
            <p className="font-medium text-sm">{isRunning ? 'Monitoring active' : 'Not monitoring'}</p>
            <p className="text-xs text-gray-400">
              {isRunning ? 'Polling every 5 seconds' : 'Click Start to begin tracking'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadStatus}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {isRunning ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Square size={14} /> Stop
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Play size={14} /> Start
            </button>
          )}
        </div>
      </div>

      {/* Today's summary */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Today's Activity — {totalMin} min tracked
      </h3>

      {topApps.length === 0 ? (
        <p className="text-gray-400 text-sm">No activity recorded yet. Start monitoring to begin tracking.</p>
      ) : (
        <div className="space-y-3">
          {topApps.map((item, i) => {
            const pct = totalMin > 0 ? Math.round((item.seconds / 60 / totalMin) * 100) : 0
            return (
              <div key={item.app} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor size={16} className="text-brand-500" />
                    <span className="font-medium text-sm">{item.app}</span>
                  </div>
                  <span className="text-sm text-gray-500">{Math.round(item.seconds / 60)} min ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-brand-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
