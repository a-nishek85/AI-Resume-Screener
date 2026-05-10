import { motion } from 'framer-motion'
import { Download, FileJson, FileSpreadsheet, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getResults, listJDs } from '../services/api'

function dl(content, type, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

export default function Export() {
  const [jds, setJDs] = useState([])
  const [jdId, setJdId] = useState('')
  const [all, setAll] = useState([])
  const [jd, setJd] = useState(null)

  useEffect(() => {
    listJDs().then(r => { setJDs(r.data); if (r.data.length) setJdId(String(r.data[0].id)) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!jdId) return
    getResults(jdId).then(r => { setAll(r.data.candidates || []); setJd({ id: jdId, title: r.data.jd_title }) }).catch(() => {})
  }, [jdId])

  const shortlisted = all.filter(c => c.shortlisted).sort((a,b) => b.scores.total_score - a.scores.total_score)

  const exportJSON = () => {
    dl(JSON.stringify({ exported_at: new Date().toISOString(), jd, total: all.length, shortlisted: shortlisted.length, candidates: all }, null, 2), 'application/json', `shortlist-${Date.now()}.json`)
    toast.success('JSON exported')
  }

  const exportCSV = () => {
    const h = ['Rank','Name','Email','Total','Skills','Experience','Education','Projects','Communication','Status']
    const rows = all.map((c,i) => [i+1, c.name, c.email||'', c.scores.total_score, c.scores.skills_score, c.scores.experience_score, c.scores.education_score, c.scores.projects_score, c.scores.communication_score, c.shortlisted?'Shortlisted':c.scores.total_score>=40?'Review':'Not selected'])
    dl([h,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n'), 'text/csv', `candidates-${Date.now()}.csv`)
    toast.success('CSV exported')
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 pb-16">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="py-8">
        <h1 className="text-xl font-bold tracking-tight mb-1">Export & Reports</h1>
        <p className="text-sm text-slate-400">Download screening results and shortlist reports.</p>
      </motion.div>

      <div className="mb-4">
        <select value={jdId} onChange={e => setJdId(e.target.value)}
          className="bg-[#0d1117] border border-purple/25 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
          <option value="">Select Job Description</option>
          {jds.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {/* Shortlist Preview */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="glass p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-emerald-400" />
            <span className="text-sm font-semibold">Shortlist Preview</span>
          </div>
          <span className="text-xs text-slate-500">{shortlisted.length} candidate{shortlisted.length !== 1 ? 's' : ''}</span>
        </div>

        {shortlisted.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl opacity-10 mb-3">📄</div>
            <div className="text-sm text-slate-400">No shortlisted candidates yet</div>
            <div className="text-xs text-slate-600 mt-1">Screen resumes to see your shortlist here</div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {shortlisted.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple/30 to-indigo-500/30 border border-purple/30 flex items-center justify-center text-xs font-bold text-purple-light flex-shrink-0">
                  {c.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">#{i+1} {c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{(c.skills||[]).slice(0,3).join(' · ') || '—'}</div>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">{c.scores.total_score}%</div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Export Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: FileJson, label:'JSON Export', desc:'Full structured data — all candidates, scores, skills, and AI justifications for every dimension.', action: exportJSON, btn:'btn-grad', btnLabel:'⬇ Download JSON' },
          { icon: FileSpreadsheet, label:'CSV Report', desc:'Spreadsheet-ready candidate rankings with all score dimensions for team review.', action: exportCSV, btn:'btn-ghost', btnLabel:'⬇ Download CSV' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.15 + i * 0.07 }}
            className="glass glass-hover p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple/3 to-transparent pointer-events-none rounded-2xl" />
            <card.icon size={32} className="mx-auto mb-3 text-slate-500" />
            <div className="text-sm font-bold mb-1.5">{card.label}</div>
            <div className="text-xs text-slate-400 mb-5 leading-relaxed">{card.desc}</div>
            <button onClick={card.action} className={`${card.btn} justify-center`}>
              <Download size={13} />{card.btnLabel}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}