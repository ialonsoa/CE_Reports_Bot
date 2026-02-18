import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadReport, getTemplates, deleteTemplate } from '../services/api'

export default function UploadReports() {
  const [templates, setTemplates] = useState([])
  const [uploading, setUploading] = useState(false)

  const loadTemplates = () =>
    getTemplates().then(r => setTemplates(r.data.templates)).catch(() => {})

  useEffect(() => { loadTemplates() }, [])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    for (const file of acceptedFiles) {
      const toastId = toast.loading(`Uploading ${file.name}…`)
      try {
        await uploadReport(file)
        toast.success(`"${file.name}" uploaded and parsed!`, { id: toastId })
      } catch (e) {
        const detail = e.response?.data?.detail || e.message
        toast.error(`Failed: ${detail}`, { id: toastId })
      }
    }
    setUploading(false)
    loadTemplates()
  }, [])

  const handleDelete = async (name) => {
    await deleteTemplate(name)
    toast.success(`Deleted "${name}"`)
    loadTemplates()
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Upload Report Templates</h2>
      <p className="text-gray-500 mb-6">
        Upload your past reports so the bot can learn your writing style and structure. Supported: PDF, Word (.docx), Excel (.xlsx), TXT.
      </p>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-8 ${
          isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={36} className="mx-auto mb-3 text-gray-400" />
        {isDragActive
          ? <p className="text-brand-600 font-medium">Drop files here…</p>
          : <p className="text-gray-500">Drag & drop files here, or <span className="text-brand-600 font-medium">click to browse</span></p>
        }
        <p className="text-xs text-gray-400 mt-2">PDF · Word · Excel · TXT</p>
        {uploading && <p className="text-sm text-brand-600 mt-3 animate-pulse">Processing…</p>}
      </div>

      {/* Template list */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Parsed Templates ({templates.length})
      </h3>
      {templates.length === 0 ? (
        <p className="text-gray-400 text-sm">No templates yet. Upload your first report above.</p>
      ) : (
        <ul className="space-y-3">
          {templates.map(t => (
            <li key={t.name} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <FileText size={18} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{t.name}</span>
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{t.preview}</p>
              </div>
              <button
                onClick={() => handleDelete(t.name)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                title="Delete template"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
