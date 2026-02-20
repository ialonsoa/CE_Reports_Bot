import { Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Sparkles, Activity, CalendarDays } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UploadReports from './pages/UploadReports'
import GenerateReport from './pages/GenerateReport'
import ActivityMonitor from './pages/ActivityMonitor'
import Schedule from './pages/Schedule'

const navItems = [
  { to: '/',          label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/upload',    label: 'Upload Reports',  icon: Upload },
  { to: '/generate',  label: 'Generate',        icon: Sparkles },
  { to: '/activity',  label: 'Activity',        icon: Activity },
  { to: '/schedule',  label: 'Schedule',        icon: CalendarDays },
]

export default function App() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">CE Reports Bot</h1>
          <p className="text-xs text-blue-300 mt-0.5">Your daily report assistant</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-xs text-blue-300">
          v1.0.0 — CE Reports Bot
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/upload"    element={<UploadReports />} />
          <Route path="/generate"  element={<GenerateReport />} />
          <Route path="/activity"  element={<ActivityMonitor />} />
          <Route path="/schedule"  element={<Schedule />} />
        </Routes>
      </main>
    </div>
  )
}
