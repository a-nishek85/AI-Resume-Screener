import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { deleteCandidate } from '../services/api'
import ScoreBreakdown from './ScoreBreakdown'

const sc = v => v >= 65 ? 'score-high' : v >= 40 ? 'score-mid' : 'score-low'
const barColor = v => v >= 65 ? '#10b981' : v >= 40 ? '#f59e0b' : '#ef4444'

function StatusBadge({ c }) {
  if (c.shortlisted) return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Shortlisted</span>
  if (c.scores.total_score >= 40) return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>Review</span>
  return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-red-500/8 text-red-400 border border-red-500/15"><span className="w-1.5 h-1.5 rounded-full bg-red-400"/>Not selected</span>
}

function RankBubble({ rank }) {
  const cls = rank === 1 ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : rank === 2 ? 'bg-slate-400/15 text-slate-300 border-slate-400/20' : rank === 3 ? 'bg-orange-400/15 text-orange-300 border-orange-400/20' : 'bg-white/5 text-slate-500 border-white/8'
  return <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${cls}`}>{rank}</div>
}

export default function CandidateTable({ candidates, onRefresh }) {
  const [selected, setSelected] = useState(null)
  const [sort, setSort] = useState({ col: 'total', dir: -1 })
  const kMap = { skills:'skills_score', exp:'experience_score', edu:'education_score', proj:'projects_score', comm:'communication_score', total:'total_score' }

  const toggleSort = col => setSort(s => ({ col, dir: s.col === col ? -s.dir : -1 }))

  const sorted = [...candidates].sort((a, b) => {
    const k = kMap[sort.col]
    if (k) return sort.dir * (b.scores[k] - a.scores[k])
    if (sort.col === 'name') return sort.dir * a.name.localeCompare(b.name)
    return sort.dir * (a.rank - b.rank)
  })

  const handleDelete = async id => {
    if (!confirm('Remove this candidate?')) return
    try {
      await deleteCandidate(id)
      toast.success('Candidate removed')
      onRefresh()
    } catch { toast.error('Delete failed') }
  }

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return <ChevronDown size={10} className="opacity-20 ml-0.5" />
    return sort.dir === -1 ? <ChevronDown size={10} className="text-purple-light ml-0.5" /> : <ChevronUp size={10} className="text-purple-light ml-0.5" />
  }

  const Th = ({ col, children }) => (
    <th onClick={() => toggleSort(col)} className="px-3.5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none whitespace-nowrap">
      <span className="flex items-center">{children}<SortIcon col={col} /></span>
    </th>
  )

  if (!candidates.length) return (
    <div className="glass p-16 text-center">
      <div className="text-5xl opacity-10 mb-4">🔍</div>
      <div className="text-base font-medium text-slate-400">No candidates match this filter</div>
      <div className="text-sm text-slate-600 mt-1">Try switching to "All" or upload more resumes</div>
    </div>
  )

  return (
    <>
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/[0.05] bg-white/[0.02]">
              <tr>
                <Th col="rank">#</Th>
                <Th col="name">Candidate</Th>
                <Th col="skills">Skills</Th>
                <Th col="exp">Exp</Th>
                <Th col="edu">Edu</Th>
                <Th col="proj">Projects</Th>
                <Th col="comm">Comm</Th>
                <Th col="total">Total</Th>
                <th className="px-3.5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((c, i) => {
                  const tot = c.scores.total_score
                  return (
                    <motion.tr key={c.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-purple/[0.03] transition-colors">
                      <td className="px-3.5 py-3"><RankBubble rank={i+1} /></td>
                      <td className="px-3.5 py-3">
                        <div className="text-sm font-semibold text-slate-100">{c.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{c.email || '—'}</div>
                      </td>
                      <td className="px-3.5 py-3"><span className={sc(c.scores.skills_score)}>{c.scores.skills_score}%</span></td>
                      <td className="px-3.5 py-3"><span className={sc(c.scores.experience_score)}>{c.scores.experience_score}%</span></td>
                      <td className="px-3.5 py-3"><span className={sc(c.scores.education_score)}>{c.scores.education_score}%</span></td>
                      <td className="px-3.5 py-3"><span className={sc(c.scores.projects_score)}>{c.scores.projects_score}%</span></td>
                      <td className="px-3.5 py-3"><span className={sc(c.scores.communication_score)}>{c.scores.communication_score}%</span></td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 bg-white/6 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width:`${tot}%`, background:barColor(tot) }} />
                          </div>
                          <span className="text-xs font-bold font-mono" style={{ color:barColor(tot) }}>{tot}%</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3"><StatusBadge c={c} /></td>
                      <td className="px-3.5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setSelected(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white/6 hover:text-slate-200 transition-all">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-500/12 hover:text-red-400 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {selected && <ScoreBreakdown candidate={selected} onClose={() => setSelected(null)} onRefresh={onRefresh} />}
    </>
  )
}