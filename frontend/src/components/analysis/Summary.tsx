import { ScoreGauge } from './ScoreGauge'
import { getScoreColor, getScoreLabel } from '../../lib/utils'
import { Analysis } from '../../types'

interface SummaryProps {
  analysis: Analysis
}

const CATEGORY_BREAKDOWN = [
  { key: 'skills_score', label: 'Skills Match', weight: '30%', bg: 'bg-orange-50' },
  { key: 'content_score', label: 'Content', weight: '25%', bg: 'bg-purple-50' },
  { key: 'ats_score', label: 'ATS', weight: '20%', bg: 'bg-blue-50' },
  { key: 'structure_score', label: 'Structure', weight: '15%', bg: 'bg-green-50' },
  { key: 'tone_style_score', label: 'Tone & Style', weight: '10%', bg: 'bg-slate-50' },
] as const

export function Summary({ analysis }: SummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Assessment</h2>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32">
          <ScoreGauge score={analysis.overall_score} size="lg" />
        </div>

        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {getScoreLabel(analysis.overall_score)}
          </h3>
          <p className="text-gray-600 mb-4">
            Your resume scored {analysis.overall_score}/100 using a weighted blend of AI review
            and keyword/structure checks against the job description.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORY_BREAKDOWN.map(({ key, label, weight, bg }) => (
              <div key={key} className={`${bg} p-3 rounded-lg`}>
                <p className="text-xs text-gray-600">{label} ({weight})</p>
                <p className={`text-lg font-bold ${getScoreColor(analysis[key])}`}>
                  {analysis[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
