import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Activity, Sparkles, FileText, Clock, Zap } from 'lucide-react'
import { getTemplates, getActivityStatus } from '../services/api'

export default function Dashboard() {
  const [templates, setTemplates] = useState([])
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data.templates)).catch(() => {})
    getActivityStatus().then(r => setActivity(r.data)).catch(() => {})
  }, [])

  const topApp = activity?.summary?.top_apps?.[0]
  const totalMin = Math.round((activity?.summary?.total_tracked_seconds || 0) / 60)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Good morning 👋</h2>
        <p className="text-gray-500 mt-1">Here's a summary of your CE Reports Bot workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<FileText className="text-brand-600" />}
          label="Report Templates"
          value={templates.length}
          sub="uploaded files"
        />
        <StatCard
          icon={<Clock className="text-green-600" />}
          label="Activity Tracked"
          value={`${totalMin} min`}
          sub={activity?.is_running ? '🟢 monitoring active' : '⚪ not monitoring'}
        />
        <StatCard
          icon={<Zap className="text-purple-600" />}
          label="Top App Today"
          value={topApp?.app || '—'}
          sub={topApp ? `${Math.round(topApp.seconds / 60)} min` : 'no data yet'}
        />
      </div>

      {/* Quick actions */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-4">
        <QuickAction to="/upload" icon={<Upload size={20} />} label="Upload a Report Template" color="blue" />
        <QuickAction to="/activity" icon={<Activity size={20} />} label="Start Activity Monitor" color="green" />
        <QuickAction to="/generate" icon={<Sparkles size={20} />} label="Generate Today's Report" color="purple" />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">{icon}</div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  )
}

function QuickAction({ to, icon, label, color }) {
  const colors = {
    blue:   'bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100',
    green:  'bg-green-50 border-green-100 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100',
  }
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border font-medium text-sm transition-colors ${colors[color]}`}
    >
      {icon}
      {label}
    </Link>
  )
}
