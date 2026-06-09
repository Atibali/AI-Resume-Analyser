import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Summary } from '../components/analysis/Summary'
import { ATS } from '../components/analysis/ATS'
import { Details } from '../components/analysis/Details'
import { getResume, deleteResume, forceAnalyzeResume } from '../lib/api'
import { formatDate } from '../lib/utils'
import { Resume } from '../types'

export function ResumePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchResume = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getResume(id)
        setResume(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume')
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    const confirmed = window.confirm('Delete this resume and its analysis permanently?')
    if (!confirmed) return

    setActionLoading(true)
    setError('')

    try {
      await deleteResume(id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReanalyze = async () => {
    if (!id) return

    setActionLoading(true)
    setError('')

    try {
      const analysis = await forceAnalyzeResume(id)
      setResume((current) => (current ? { ...current, analysis } : current))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-run analysis')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {error || 'Resume not found'}
          </h2>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const analysis = resume.analysis

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{resume.company_name}</h1>
            <p className="text-xl text-slate-600">{resume.job_title}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Submitted {formatDate(resume.created_at)}
            </span>
            <span className={`rounded-full px-4 py-2 text-sm font-medium ${analysis ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {analysis ? 'Analysis complete' : 'Pending analysis'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h2>
                <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">{resume.job_description}</p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick details</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-900">Resume ID</p>
                    <p className="truncate">{resume.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Job title</p>
                    <p>{resume.job_title}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Company</p>
                    <p>{resume.company_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {analysis ? (
              <>
                <Summary analysis={analysis} />
                <ATS analysis={analysis} />
                <Details analysis={analysis} />
              </>
            ) : (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-sm">
                <p className="text-slate-700 text-lg font-semibold mb-4">Analysis is still pending</p>
                <p className="text-sm text-slate-500 mb-6">Your resume has been uploaded, and the AI analyzer is processing it. Try refreshing or rerunning analysis if needed.</p>
                <button
                  onClick={handleReanalyze}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {actionLoading ? 'Re-running...' : 'Re-run analysis'}
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Resume Preview</h2>
              {resume.image_path ? (
                <img
                  src={resume.image_path}
                  alt="Resume preview"
                  className="w-full rounded-3xl border border-slate-200"
                />
              ) : (
                <div className="aspect-[8.5/11] rounded-3xl bg-slate-100 flex items-center justify-center text-5xl text-slate-400">
                  📄
                </div>
              )}

              <div className="mt-6 space-y-3">
                <a
                  href={`/api${resume.file_path}`}
                  download
                  className="block w-full rounded-full bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Download PDF
                </a>
                <button
                  onClick={handleReanalyze}
                  disabled={actionLoading}
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {actionLoading ? 'Working...' : 'Re-run analysis'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Delete Resume
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Analyze Another
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
