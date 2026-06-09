import { useNavigate } from 'react-router-dom'
import { ScoreGauge } from '../analysis/ScoreGauge'
import { formatDate, getScoreLabel } from '../../lib/utils'
import { ResumeSummary } from '../../types'

interface ResumeCardProps {
  resume: ResumeSummary
  onDelete?: (resumeId: string) => void
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const navigate = useNavigate()
  const hasAnalysis = resume.overall_score !== null && resume.overall_score !== undefined

  return (
    <div
      onClick={() => navigate(`/resume/${resume.id}`)}
      className="relative group bg-white rounded-3xl border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col cursor-pointer"
    >
      {resume.image_path ? (
        <img
          src={resume.image_path}
          alt="Resume preview"
          className="w-full h-44 object-cover bg-gray-100"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
          <span className="text-5xl">📄</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg truncate">{resume.company_name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{resume.job_title}</p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {hasAnalysis ? getScoreLabel(resume.overall_score!) : 'Pending analysis'}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="text-sm text-gray-700">{formatDate(resume.created_at)}</p>
            </div>
            {hasAnalysis ? (
              <div className="w-16 h-16">
                <ScoreGauge score={resume.overall_score!} size="sm" />
              </div>
            ) : (
              <div className="text-xs text-gray-500">Awaiting review</div>
            )}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(resume.id)
          }}
          className="absolute top-4 right-4 rounded-full bg-white border border-gray-200 p-2 text-gray-500 shadow-sm hover:text-red-600 hover:border-red-200 transition"
        >
          ✕
        </button>
      )}
    </div>
  )
}
