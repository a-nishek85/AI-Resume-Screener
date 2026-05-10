import { motion } from 'framer-motion'
import { BarChart3, Brain, Download, Upload } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Upload', icon: Upload },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/export', label: 'Export', icon: Download },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 bg-[#07090f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[9px] bg-grad-purple flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <Brain size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold" style={{ background:'linear-gradient(135deg,#e2d9f3,#c4b5fd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          AI Resume Screener
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to}>
              <motion.div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-purple/15 text-purple-light border border-purple/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={13} />
                {label}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}