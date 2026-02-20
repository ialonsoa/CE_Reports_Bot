import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, Power, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSchedules, createSchedule, deleteSchedule, toggleSchedule } from '../services/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const REPORT_TYPES = [
  { value: 'daily',        label: 'Daily Report' },
  { value: 'weekly',       label: 'Weekly Summary' },
  { value: 'social_media', label: 'Social Media' },
]

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual',       label: 'Casual' },
  { value: 'concise',      label: 'Concise' },
]

const TYPE_COLOR = {
  daily:        'bg-brand-600 text-white',
  weekly:       'bg-purple-600 text-white',
  social_media: 'bg-emerald-600 text-white',
}

const DEFAULT_FORM = {
  report_type: 'daily',
  tone: 'professional',
  days: [0, 1, 2, 3, 4],   // Mon–Fri
  time: '08:00',
  notes: '',
}

export default function Schedule() {
  const [schedules, setSchedules]   = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(DEFAULT_FORM)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await getSchedules()
      setSchedules(res.data)
    } catch {
      toast.error('Could not load schedules')
    }
  }

  async function handleCreate() {
    if (form.days.length === 0) { toast.error('Pick at least one day'); return }
    setSaving(true)
    try {
      await createSchedule(form)
      toast.success('Schedule created!')
      setShowModal(false)
      setForm(DEFAULT_FORM)
      load()
    } catch {
      toast.error('Failed to create schedule')
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    try {
      await deleteSchedule(id)
      toast.success('Schedule removed')
      load()
    } catch {
      toast.error('Failed to remove schedule')
    }
  }

  async function handleToggle(id) {
    try {
      await toggleSchedule(id)
      load()
    } catch {
      toast.error('Failed to toggle schedule')
    }
  }

  function toggleDay(i) {
    setForm(f => ({
      ...f,
      days: f.days.includes(i)
        ? f.days.filter(d => d !== i)
        : [...f.days, i].sort((a, b) => a - b),
    }))
  }

  // Bucket schedules into the 7 columns of the weekly grid
  const byDay = DAYS.map((_, i) => schedules.filter(s => s.days.includes(i)))

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Report Schedule</h2>
          <p className="text-gray-500 mt-0.5">
            Auto-generate &amp; email reports to{' '}
            <span className="font-medium text-gray-700">ialonsoa@byu.edu</span>{' '}
            on a recurring schedule.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      {/* Weekly grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide ${i < 6 ? 'border-r border-gray-100' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Schedule pills */}
        <div className="grid grid-cols-7 min-h-[160px]">
          {byDay.map((daySchedules, i) => (
            <div
              key={i}
              className={`p-2 space-y-1.5 ${i < 6 ? 'border-r border-gray-100' : ''}`}
            >
              {daySchedules.map(s => (
                <div
                  key={s.id + '-' + i}
                  className={`rounded-md px-2 py-1.5 text-xs transition-opacity select-none ${TYPE_COLOR[s.report_type]} ${!s.active ? 'opacity-40' : ''}`}
                  title={`${s.report_type.replace('_', ' ')} at ${s.time} — ${s.active ? 'active' : 'paused'}`}
                >
                  <div className="font-semibold">{s.time}</div>
                  <div className="opacity-80 capitalize">{s.report_type.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule list */}
      {schedules.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No schedules yet. Hit <strong>Add Schedule</strong> to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div
              key={s.id}
              className={`bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 transition-opacity ${!s.active ? 'opacity-55' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm capitalize">{s.report_type.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{s.tone}</span>
                  {s.notes && (
                    <>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400 italic truncate max-w-[200px]">{s.notes}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {s.days.map(d => DAYS[d]).join(', ')} at {s.time}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggle(s.id)}
                  className={`p-1.5 rounded-lg transition-colors ${s.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={s.active ? 'Pause' : 'Resume'}
                >
                  <Power size={15} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">New Schedule</h3>
              <button
                onClick={() => { setShowModal(false); setForm(DEFAULT_FORM) }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Report type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="flex gap-2 flex-wrap">
                  {REPORT_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, report_type: t.value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.report_type === t.value
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-brand-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="flex gap-2">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, tone: t.value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.tone === t.value
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-200 text-gray-600 hover:border-purple-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                <div className="flex gap-2">
                  {DAYS.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        form.days.includes(i)
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Highlight team meetings"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => { setShowModal(false); setForm(DEFAULT_FORM) }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating…' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
