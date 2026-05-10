import { motion } from 'framer-motion'
import { Save, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { overrideCandidate } from '../services/api'

const dims = [
  { key:'skills_score', label:'Skills Match', weight:'30%', color:'#818cf8' },
  { key:'experience_score', label:'Experience Relevance', weight:'25%', color:'#6ee7b7' },
  { key:'education_score', label:'Education & Certs', weight:'15%', color:'#60a5fa' },
  { key:'projects_score', label:'Project / Portfolio', weight:'20%', color:'#fcd34d' },
  { key:'communication_score', label:'Communication Quality', weight:'10%', color:'#fb923c' },
]

export default function ScoreBreakdown({ candidate: c, onClose, onRefresh }) {
  const [status, setStatus] = useState(c.shortlisted ? 'shortlisted' : '')
  const [adj, setAdj] = useState(c.score_adjustment || 0)
  const [comment, setComment] = useState(c.hr_comment || '')
  const [saving, setSaving] = useState(false)

  const tot = c.scores.total_score
  const totColor = tot >= 65 ? '#6ee7b7' : tot >= 40 ? '#fcd34d' : '#fca5a5'
  const conf = c.confidence_score ? Math.round(c.confidence_score * 100) : Math.round(50 + tot * 0.5)
  const just = c.justifications || {}

  const saveOverride = async () => {
    setSaving(true)
    try {
      await overrideCandidate(c.id, { status, score_adjustment: parseFloat(adj) || 0, comment })
      toast.success('HR override saved')
      onRefresh?.()
      onClose()
    } catch {
      toast('Override saved locally', { icon:'💾' })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity:0, y:20, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.97 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0d1117] border border-purple/30 rounded-2xl w-full max-w-[660px] max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(139,92,246,0.25)]">

        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <div className="text-base font-bold">{c.name}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{c.email || ''}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {/* Score Hero */}
          <div className="text-center bg-purple/6 border border-purple/15 rounded-xl p-5 mb-5">
            <div className="text-5xl font-extrabold tracking-tight font-mono mb-1" style={{ color:totColor }}>{tot}%</div>
            <div className="text-xs text-slate-500">Overall Match Score</div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Confidence:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${conf>=65?'score-high':conf>=40?'score-mid':'score-low'}`}>{conf}%</span>
              {c.shortlisted
                ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">✓ Shortlisted</span>
                : <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">⊙ Review</span>}
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="flex flex-col gap-2 mb-5">
            {dims.map(d => {
              const val = c.scores[d.key]
              const j = just[d.key.replace('_score','')] || ''
              return (
                <div key={d.key} className="bg-white/[0.025] border border-white/5 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{d.label}</span>
                      <span className="text-xs text-slate-600 ml-1.5">· {d.weight}</span>
                    </div>
                    <span className="text-sm font-bold font-mono" style={{ color:d.color }}>{val}%</span>
                  </div>
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden mb-2">
                    <motion.div initial={{ width:0 }} animate={{ width:`${val}%` }} transition={{ duration:0.8, delay:0.1 }}
                      className="h-full rounded-full" style={{ background:d.color }} />
                  </div>
                  {j && <p className="text-xs text-slate-500 italic leading-relaxed">💡 {j}</p>}
                </div>
              )
            })}
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[
              { title:'Skills', items: c.skills?.slice(0,8) },
              { title:'Education', items: c.education },
            ].map(s => (
              <div key={s.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{s.title}</div>
                {(s.items||[]).length ? (s.items||[]).map((item,i)=>(
                  <div key={i} className="text-xs text-slate-400 flex gap-1.5 mb-1 leading-relaxed">
                    <span className="text-indigo-400 flex-shrink-0">›</span>{item}
                  </div>
                )) : <div className="text-xs text-slate-600">—</div>}
              </div>
            ))}
            {[
              { title:'Experience', items: c.experience?.slice(0,4) },
              { title:'Projects', items: c.projects?.slice(0,3) },
            ].map(s => (
              <div key={s.title} className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{s.title}</div>
                {(s.items||[]).length ? (s.items||[]).map((item,i)=>(
                  <div key={i} className="text-xs text-slate-400 flex gap-1.5 mb-1 leading-relaxed">
                    <span className="text-indigo-400 flex-shrink-0">›</span>{item}
                  </div>
                )) : <div className="text-xs text-slate-600">—</div>}
              </div>
            ))}
          </div>

          {/* HR Override */}
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
            <div className="text-xs font-semibold text-indigo-400 mb-3">🧑‍💼 HR Override</div>
            <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Override Status</label>
                <select value={status} onChange={e=>setStatus(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none">
                  <option value="">No override</option>
                  <option value="shortlisted">✓ Shortlisted</option>
                  <option value="hold">⊙ Hold for Review</option>
                  <option value="rejected">✕ Reject</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Score Adj.</label>
                <input type="number" min="-20" max="20" value={adj} onChange={e=>setAdj(e.target.value)}
                  placeholder="±0" className="w-20 bg-white/4 border border-white/8 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none" />
              </div>
            </div>
            <label className="block text-xs text-slate-500 mb-1">HR Comment</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2}
              placeholder="Add notes about this candidate..."
              className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none resize-none mb-3" />
            <button onClick={saveOverride} disabled={saving}
              className="btn-ghost text-xs py-1.5 w-auto px-4">
              <Save size={12} />{saving ? 'Saving...' : 'Save Override'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}