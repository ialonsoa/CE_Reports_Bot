import { useState } from 'react'
import { Sparkles, Copy, Check, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateReport } from '../services/api'

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Summary' },
  { value: 'social_media', label: 'Social Media Post' },
]

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'concise', label: 'Concise' },
]

export default function GenerateReport() {
  const [reportType, setReportType] = useState('daily')
  const [tone, setTone] = useState('professional')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')
    try {
      const res = await generateReport({ report_type: reportType, tone, additional_notes: notes })
      setResult(res.data.content)
      toast.success('Report generated!')
    } catch (e) {
      const detail = e.response?.data?.detail || e.message
      toast.error(`Generation failed: ${detail}`)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Generate Report</h2>
      <p className="text-gray-500 mb-6">
        The AI will use your uploaded templates and today's activity data to draft a report ready to send to your team.
      </p>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="flex gap-2">
            {REPORT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setReportType(t.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  reportType === t.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  tone === t.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Highlight the Tableau dashboard published today, mention the Q4 social campaign…"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          <Sparkles size={18} />
          {loading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Generated Report</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={`mailto:?subject=Daily Report&body=${encodeURIComponent(result)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Send size={14} /> Send via Email
              </a>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{result}</pre>
        </div>
      )}
    </div>
  )
}
