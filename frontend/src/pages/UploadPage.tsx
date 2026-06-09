import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUploader } from '../components/common/FileUploader'
import { uploadResume, analyzeResume } from '../lib/api'

export function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const descriptionLength = jobDescription.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !companyName || !jobTitle || !jobDescription) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const uploadResponse = await uploadResume(
        file,
        companyName,
        jobTitle,
        jobDescription
      )

      await analyzeResume(uploadResponse.id)
      navigate(`/resume/${uploadResponse.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload and analyze resume')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl bg-white/90 p-8 shadow-lg border border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Upload and Analyze</h1>
          <p className="text-lg text-slate-600">
            Add your resume and the target job description to get tailored AI feedback instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Resume PDF
              </label>
              <FileUploader onFileSelect={setFile} />
              {file && (
                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">Selected file</p>
                  <p>{file.name}</p>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Microsoft"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>{descriptionLength} characters</span>
                <span>{descriptionLength > 1200 ? 'Consider shortening to improve feedback accuracy.' : 'Recommended 150–1200 characters'}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Analyzing... This may take a minute' : 'Start analysis'}
          </button>
        </form>
      </div>
    </div>
  )
}
