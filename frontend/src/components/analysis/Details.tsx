import { ScoreBadge } from './ScoreBadge'
import { Accordion } from '../common/Accordion'
import { Analysis } from '../../types'

interface DetailsProps {
  analysis: Analysis
}

export function Details({ analysis }: DetailsProps) {
  const categories = [
    {
      id: 'tone',
      title: `Tone & Style - ${analysis.tone_style_score}/100`,
      score: analysis.tone_style_score,
      tips: analysis.tone_style_tips,
    },
    {
      id: 'content',
      title: `Content Quality - ${analysis.content_score}/100`,
      score: analysis.content_score,
      tips: analysis.content_tips,
    },
    {
      id: 'structure',
      title: `Structure & Formatting - ${analysis.structure_score}/100`,
      score: analysis.structure_score,
      tips: analysis.structure_tips,
    },
    {
      id: 'skills',
      title: `Skills Match - ${analysis.skills_score}/100`,
      score: analysis.skills_score,
      tips: analysis.skills_tips,
    },
  ]

  const accordionItems = categories.map((category) => ({
    id: category.id,
    title: category.title,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Score</span>
          <ScoreBadge score={category.score} />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-green-700 text-sm">Strengths</h4>
          {category.tips
            .filter((tip) => tip.type === 'good')
            .map((tip, idx) => (
              <div key={idx} className="flex gap-2 text-sm">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">{tip.tip}</span>
              </div>
            ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-orange-700 text-sm">Improvements</h4>
          {category.tips
            .filter((tip) => tip.type === 'improve')
            .map((tip, idx) => (
              <div key={idx} className="flex gap-2 text-sm">
                <span className="text-orange-600 font-bold">→</span>
                <span className="text-gray-700">{tip.tip}</span>
              </div>
            ))}
        </div>
      </div>
    ),
  }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Feedback</h2>
      <Accordion items={accordionItems} />
    </div>
  )
}
