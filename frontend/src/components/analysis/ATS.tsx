import { ScoreBadge } from './ScoreBadge'
import { Analysis } from '../../types'

interface ATSProps {
  analysis: Analysis
}

export function ATS({ analysis }: ATSProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ATS Compatibility</h2>
        <ScoreBadge score={analysis.ats_score} size="lg" />
      </div>

      <p className="text-gray-600 mb-6">
        ATS (Applicant Tracking System) scores evaluate how well your resume is formatted
        for automated screening by HR systems.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Strengths</h3>
          <div className="space-y-2">
            {analysis.ats_tips
              .filter((tip) => tip.type === 'good')
              .map((tip, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-lg">✓</span>
                  <p className="text-sm text-green-900">{tip.tip}</p>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Areas to Improve</h3>
          <div className="space-y-2">
            {analysis.ats_tips
              .filter((tip) => tip.type === 'improve')
              .map((tip, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-lg">→</span>
                  <p className="text-sm text-yellow-900">{tip.tip}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
