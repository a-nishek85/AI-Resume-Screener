import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

const rows = [
  { icon:'⚡', name:'Skills Match', weight:'30%', poor:'< 30% skills match', avg:'50–70% skills match', exc:'> 85% skills match' },
  { icon:'💼', name:'Experience Relevance', weight:'25%', poor:'Unrelated domain', avg:'Adjacent domain', exc:'Exact domain & seniority' },
  { icon:'🎓', name:'Education & Certs', weight:'15%', poor:'Does not meet minimum', avg:'Meets minimum', exc:'Exceeds + extra certs' },
  { icon:'🗂️', name:'Project / Portfolio', weight:'20%', poor:'No evidence', avg:'1–2 generic projects', exc:'Strong relevant portfolio' },
  { icon:'✍️', name:'Communication Quality', weight:'10%', poor:'Poor structure/grammar', avg:'Adequate clarity', exc:'Crisp, structured, impactful' },
]

export default function ScoringRubric() {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight mb-1">📋 Scoring Rubric</h2>
        <p className="text-sm text-slate-400">AI evaluates candidates across multiple weighted hiring dimensions.</p>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6" style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08))' }}>
                {['Dimension','Weight','0 — Poor','5 — Average','10 — Excellent'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-purple-light/80 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.name} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.05 * i }}
                  className="border-b border-white/[0.03] hover:bg-purple/3 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="mr-2">{r.icon}</span>
                    <span className="text-sm font-semibold text-slate-100">{r.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold bg-gradient-to-r from-purple/20 to-indigo-500/15 border border-purple/30 text-purple-light px-2.5 py-1 rounded-full font-mono">{r.weight}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-red-300 leading-relaxed">{r.poor}</td>
                  <td className="px-4 py-3.5 text-xs text-amber-300 leading-relaxed">{r.avg}</td>
                  <td className="px-4 py-3.5 text-xs text-emerald-300 leading-relaxed">{r.exc}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          className="flex items-start gap-3 m-4 bg-indigo-500/6 border border-indigo-500/20 rounded-xl p-4">
          <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-300/80 leading-relaxed">
            The AI prints dimension-level scores, weighted totals, and one-line justifications for every candidate.
            Scores combine exact keyword matching (70%) with SentenceTransformer semantic similarity (30%).
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}