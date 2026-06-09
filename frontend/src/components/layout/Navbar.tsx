import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">ResumAI</p>
                <p className="text-xs text-slate-500">Smarter resume feedback</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="text-slate-700 hover:text-blue-600 font-medium transition"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
