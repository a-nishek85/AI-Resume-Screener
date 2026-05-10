import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import CandidateTable from '../components/CandidateTable'
import ScoringRubric from '../components/ScoringRubric'
import StatsCards from '../components/StatsCards'
import { getResults, listJDs } from '../services/api'

export default function Results() {
  const [params] = useSearchParams()
  const [jds, setJDs] = useState([])
  const [jdId, setJdId] = useState(params.get('jd') || '')
  const [jdTitle, setJdTitle] = useState('')
  const [all, setAll] = useState([])
  const [shown, setShown] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listJDs().then(r => {
      setJDs(r.data)
      if (!jdId && r.data.length) { setJdId(String(r.data[0].id)) }
    }).catch(() => {})
  }, [])

  useEffect(() => { if (jdId) load(jdId) }, [jdId])

  const load = async (id) => {
    setLoading(true)
    try {
      const { data } = await getResults(id)
      setAll(data.candidates || [])
      setJdTitle(data.jd_title || '')
      applyFilter(filter, data.candidates || [])
    } catch { toast.error('Failed to load results') }
    finally { setLoading(false) }
  }

  const applyFilter = (f, source = all) => {
    setFilter(f)
    if (f === 'all') setShown([...source])
    else if (f === 'shortlisted') setShown(source.filter(c => c.shortlisted))
    else setShown(source.filter(c => !c.shortlisted && c.scores.total_score >= 40))
  }

  const stats = {
    total: all.length,
    shortlisted: all.filter(c => c.shortlisted).length,
    avg: all.length ? +(all.reduce((a, c) => a + c.scores.total_score, 0) / all.length).toFixed(1) : null,
    rate: all.length ? Math.round(all.filter(c => c.shortlisted).length / all.length * 100) : null,
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 pb-16">
      <div className="py-6">
        <StatsCards stats={stats} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Candidate Rankings</h1>
          <p className="text-xs text-slate-500 mt-0.5">{jdTitle || 'Select a job description below'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={jdId} onChange={e => setJdId(e.target.value)}
            className="bg-[#0d1117] border border-purple/25 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none font-sans">
            <option value="">Select Job Description</option>
            {jds.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <div className="flex bg-white/4 border border-white/7 rounded-xl overflow-hidden">
            {['all','shortlisted','review'].map(f => (
              <button key={f} onClick={() => applyFilter(f)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors ${filter===f?'bg-purple/20 text-purple-light':'text-slate-500 hover:text-slate-300'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScoringRubric />

      {loading ? (
        <div className="glass p-16 text-center">
          <Loader2 size={24} className="animate-spin text-purple-light mx-auto mb-3" />
          <div className="text-sm text-slate-400">Loading candidates...</div>
        </div>
      ) : (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <div className="glass overflow-hidden mb-1">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
              <span className="text-sm font-semibold">Candidates</span>
              <div className="flex gap-2">
                <span className="text-xs text-slate-500">{shown.length} shown · {stats.shortlisted} shortlisted</span>
              </div>
            </div>
          </div>
          <CandidateTable candidates={shown} onRefresh={() => load(jdId)} />
        </motion.div>
      )}
    </div>
  )
}