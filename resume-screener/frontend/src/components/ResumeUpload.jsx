import { AnimatePresence, motion } from 'framer-motion'
import { FileCheck, Loader2, Lock, Upload, Users, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadResumes } from '../services/api'

export default function ResumeUpload({ jd, onScreeningDone }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState(null)

  const onDrop = useCallback(newFiles => {
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...newFiles.filter(f => !names.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: true, disabled: !jd
  })

  const removeFile = name => setFiles(p => p.filter(f => f.name !== name))

  const steps = ['Uploading resumes...', 'Extracting text...', 'AI parsing candidates...', 'Computing embeddings...', 'Scoring & ranking...']

  const handleScreen = async () => {
    if (!jd || !files.length) return
    setLoading(true); setResult(null)
    let step = 0
    const iv = setInterval(() => {
      if (step < steps.length) { setProgressLabel(steps[step]); setProgress((step + 1) / steps.length * 85); step++ }
    }, 1600)

    try {
      const { data } = await uploadResumes(jd.id, files)
      clearInterval(iv); setProgress(100); setProgressLabel(`Done — ${data.processed} candidates processed`)
      setResult(data)
      onScreeningDone(jd.id, data)
      toast.success(`${data.processed} resumes screened${data.errors ? ` · ${data.errors} errors` : ''}`)
    } catch (e) {
      clearInterval(iv)
      toast.error(e.response?.data?.detail || e.message || 'Screening failed')
    } finally {
      setLoading(false)
      setTimeout(() => { setProgress(0); setProgressLabel('') }, 2000)
    }
  }

  return (
    <div className="glass glass-hover p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple/3 to-transparent pointer-events-none rounded-2xl" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-purple/15 border border-purple/25 flex items-center justify-center">
            <Users size={16} className="text-purple-light" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Candidate Resumes</div>
            <div className="text-xs text-slate-500 mt-0.5">Multiple files supported</div>
          </div>
        </div>
        <span className="text-xs font-semibold bg-purple/12 border border-purple/20 text-purple-light px-2.5 py-1 rounded-full">Step 2</span>
      </div>

      <AnimatePresence>
        {!jd && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden mb-4">
            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2 text-xs font-medium">
              <Lock size={12} /> Upload & analyze a Job Description first
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-250 mb-3 ${
          !jd ? 'opacity-50 cursor-not-allowed border-white/6' :
          isDragActive ? 'cursor-copy border-purple/60 bg-purple/6 shadow-[0_0_20px_rgba(139,92,246,0.15)]' :
          'cursor-pointer border-white/10 hover:border-purple/35 hover:bg-purple/3'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div animate={{ y: isDragActive ? -4 : 0 }}>
          <Upload size={28} className="mx-auto mb-2.5 text-slate-600" />
          <p className="text-sm text-slate-400">Drop resumes here or <span className="text-purple-light">click to browse</span></p>
          <p className="text-xs text-slate-600 mt-1">PDF · DOCX · Bulk upload supported</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col gap-1.5 max-h-36 overflow-y-auto mb-3">
            {files.map(f => (
              <motion.div key={f.name} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                className="flex items-center gap-2 bg-white/3 border border-white/6 rounded-lg px-2.5 py-1.5 text-xs">
                <FileCheck size={12} className="text-purple-light flex-shrink-0" />
                <span className="flex-1 truncate text-slate-300">{f.name}</span>
                <span className="text-slate-500 flex-shrink-0">{(f.size/1024).toFixed(0)}KB</span>
                <button onClick={() => removeFile(f.name)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {progress > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="mb-4 overflow-hidden">
            <div className="text-xs text-slate-400 mb-1.5">{progressLabel}</div>
            <div className="h-1 bg-white/6 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500" animate={{ width:`${progress}%` }} transition={{ duration:0.5 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="btn-grad-green w-full"
        onClick={handleScreen}
        disabled={!jd || !files.length || loading}
        whileHover={!loading ? { scale:1.01 } : {}}
        whileTap={!loading ? { scale:0.99 } : {}}
      >
        {loading ? <><Loader2 size={14} className="animate-spin" />{progressLabel || 'Processing...'}</>
          : `🚀 Screen ${files.length || ''} Resume${files.length !== 1 ? 's' : ''}`}
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-400">{result.processed}</div>
              <div className="text-xs text-slate-500 mt-0.5">Processed</div>
            </div>
            <div className="bg-red-500/6 border border-red-500/15 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-400">{result.errors}</div>
              <div className="text-xs text-slate-500 mt-0.5">Errors</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}