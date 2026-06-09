import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResumeCard } from '../components/resume/ResumeCard'
import { useStore } from '../lib/store'
import { getAllResumes, deleteResume } from '../lib/api'

export function HomePage() {
  const { resumes, isLoading, error, setResumes, setIsLoading, setError } = useStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'pending'>('all')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllResumes()
      setResumes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resumes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (resumeId: string) => {
    const confirmed = window.confirm('Delete this resume and its analysis?')
    if (!confirmed) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteResume(resumeId)
      setResumes(resumes.filter((resume) => resume.id !== resumeId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResumes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return resumes.filter((resume) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${resume.company_name} ${resume.job_title}`.toLowerCase().includes(normalizedQuery)

      const matchesFilter =
        filter === 'all' ||
        (filter === 'analyzed' && resume.overall_score !== null && resume.overall_score !== undefined) ||
        (filter === 'pending' && (resume.overall_score === null || resume.overall_score === undefined))

      return matchesQuery && matchesFilter
    })
  }, [resumes, query, filter])

  const analyzedCount = resumes.filter((resume) => resume.overall_score !== null && resume.overall_score !== undefined).length
  const pendingCount = resumes.length - analyzedCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Resume Intelligence</h1>
            <p className="text-lg text-gray-600">
              Search, filter, and manage your resume analyses with improved insights.
            </p>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 transition"
          >
            Upload New Resume
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-10">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Total resumes</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{resumes.length}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Analyzed</p>
            <p className="mt-4 text-3xl font-semibold text-green-600">{analyzedCount}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Pending</p>
            <p className="mt-4 text-3xl font-semibold text-orange-600">{pendingCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr] mb-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700">Search resumes</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company or role"
              className="mt-3 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-700">Filter status</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { id: 'all', label: 'All' },
                { id: 'analyzed', label: 'Analyzed' },
                { id: 'pending', label: 'Pending' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id as 'all' | 'analyzed' | 'pending')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filter === option.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your resumes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchResumes}
              className="text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Try again
            </button>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No matching resumes
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find a resume.
            </p>
            <Link
              to="/upload"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Upload Another Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
