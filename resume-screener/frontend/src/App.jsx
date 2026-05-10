import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Export from './pages/Export'
import Home from './pages/Home'
import Results from './pages/Results'

export default function App() {
  return (
    <div className="min-h-screen bg-[#07090f] relative">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />
      {/* Orbs */}
      <div className="fixed -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-purple/5 blur-[100px] pointer-events-none z-0" />
      <div className="fixed -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-indigo-500/4 blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background:'#0d1117', color:'#f1f5f9', border:'1px solid rgba(139,92,246,0.3)', borderRadius:'12px', fontSize:'13px' },
          success: { iconTheme: { primary:'#10b981', secondary:'#0d1117' } },
          error: { iconTheme: { primary:'#ef4444', secondary:'#0d1117' } },
        }}
      />
    </div>
  )
}