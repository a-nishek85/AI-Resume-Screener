import { motion } from 'framer-motion'
import { CheckCircle, Target, TrendingUp, Users } from 'lucide-react'

const cards = [
  { id:'total', label:'Total Candidates', icon:Users, color:'text-indigo-400', glow:'from-indigo-500/5' },
  { id:'short', label:'Shortlisted', icon:CheckCircle, color:'text-emerald-400', glow:'from-emerald-500/5' },
  { id:'avg', label:'Avg Score', icon:TrendingUp, color:'text-amber-400', glow:'from-amber-500/5' },
  { id:'rate', label:'Pass Rate', icon:Target, color:'text-purple-light', glow:'from-purple/5' },
]

export default function StatsCards({ stats }) {
  const values = [stats.total, stats.shortlisted, stats.avg ? stats.avg + '%' : '—', stats.rate ? stats.rate + '%' : '—']

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}
          className={`glass glass-hover p-5 bg-gradient-to-br ${c.glow} to-transparent cursor-default`}>
          <div className="flex items-center gap-2 mb-3">
            <c.icon size={14} className={c.color} />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
          </div>
          <div className={`text-3xl font-bold tracking-tight ${c.color}`}>{values[i]}</div>
        </motion.div>
      ))}
    </div>
  )
}