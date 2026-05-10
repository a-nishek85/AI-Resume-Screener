import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JDUpload from '../components/JDUpload'
import ResumeUpload from '../components/ResumeUpload'

export default function Home() {
  const [jd, setJD] = useState(null)
  const navigate = useNavigate()

  const handleDone = (jdId) => {
    setTimeout(() => navigate('/results'), 900)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* Hero */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center py-14">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          className="inline-flex items-center gap-2 bg-purple/10 border border-purple/25 text-purple-light px-4 py-1.5 rounded-full text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          GPT-4o · SentenceTransformers · FastAPI
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          <span className="text-grad-purple">AI Resume Screening</span><br />
          <span className="text-grad-pink">for Modern HR Teams</span>
        </h1>
        <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
          Upload a JD, drop in resumes, and get AI-ranked candidates with full score breakdowns in seconds.
        </p>
      </motion.div>

      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}>
          <JDUpload onJDUploaded={setJD} />
        </motion.div>

        <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}>
          {jd && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-2 text-xs text-purple-light bg-purple/8 border border-purple/15 rounded-lg px-3 py-2 mb-3">
              <ArrowRight size={12} /> JD ready: <span className="font-semibold">{jd.title}</span>
            </motion.div>
          )}
          <ResumeUpload jd={jd} onScreeningDone={handleDone} />
        </motion.div>
      </div>
    </div>
  )
}