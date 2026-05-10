import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, FileText, Loader2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadJD } from '../services/api'

export default function JDUpload({ onJDUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [uploaded, setUploaded] = useState(null)

  const onDrop = useCallback(files => {
    if (!files[0]) return
    setFile(files[0])
    if (!title) setTitle(files[0].name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1
  })

  const steps = ['Uploading file...', 'Extracting text...', 'Running AI extraction...', 'Parsing requirements...']

  const handleUpload = async () => {
    if (!file || !title.trim()) { toast.error('Add a job title and select a file'); return }
    setLoading(true)
    let step = 0
    const iv = setInterval(() => {
      if (step < steps.length) { setProgressLabel(steps[step]); setProgress((step + 1) / steps.length * 85); step++ }
    }, 900)

    try {
      const { data } = await uploadJD(title.trim(), file)
      clearInterval(iv); setProgress(100); setProgressLabel('Done!')
      setUploaded(data)
      onJDUploaded(data)
      toast.success(`JD analyzed — ${data.required_skills?.length || 0} skills found`)
    } catch (e) {
      clearInterval(iv)
      const msg = e.response?.data?.detail || e.message || 'Upload failed'
      toast.error(msg)
    } finally {
      setLoading(false)
      setTimeout(() => { setProgress(0); setProgressLabel('') }, 1500)
    }
  }

  return (
    <div className="glass glass-hover p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-transparent pointer-events-none rounded-2xl" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Job Description</div>
            <div className="text-xs text-slate-500 mt-0.5">PDF · DOCX · TXT</div>
          </div>
        </div>
        <span className="text-xs font-semibold bg-purple/12 border border-purple/20 text-purple-light px-2.5 py-1 rounded-full">Step 1</span>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
        <input
          className="form-input-dark"
          placeholder="e.g. Senior Backend Engineer"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-250 mb-4 ${
          isDragActive ? 'border-purple/60 bg-purple/6 shadow-[0_0_20px_rgba(139,92,246,0.15)]' :
          file ? 'border-purple/40 bg-purple/4' : 'border-white/10 hover:border-purple/35 hover:bg-purple/3'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div animate={{ y: isDragActive ? -4 : 0 }} transition={{ duration: 0.2 }}>
          <Upload size={28} className={`mx-auto mb-2.5 ${file ? 'text-purple-light' : 'text-slate-600'}`} />
          {file ? (
            <p className="text-sm font-medium text-purple-light">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-slate-400">Drop JD file here or <span className="text-purple-light">click to browse</span></p>
              <p className="text-xs text-slate-600 mt-1">PDF · DOCX · TXT · Max 10MB</p>
            </>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {progress > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="mb-4 overflow-hidden">
            <div className="text-xs text-slate-400 mb-1.5">{progressLabel}</div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-dark to-indigo-DEFAULT" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="btn-grad w-full"
        onClick={handleUpload}
        disabled={!file || !title || loading}
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
      >
        {loading ? <><Loader2 size={14} className="animate-spin" />Analyzing JD...</> : '✨ Upload & Analyze JD'}
      </motion.button>

      <AnimatePresence>
        {uploaded && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-4 bg-emerald-500/6 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
              <CheckCircle size={13} /> JD Analyzed Successfully
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(uploaded.required_skills || []).slice(0, 7).map(s => (
                <span key={s} className="text-xs bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded">{s}</span>
              ))}
              {(uploaded.nice_to_have_skills || []).slice(0, 3).map(s => (
                <span key={s} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Experience: {uploaded.experience_required || '—'} · {(uploaded.qualifications||[]).length} qualifications</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}