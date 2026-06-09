import { getScoreBgColor, getScoreColor } from '../../lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`${getScoreBgColor(score)} ${getScoreColor(
        score
      )} font-semibold rounded-full inline-block ${sizeClasses[size]}`}
    >
      {score}
    </div>
  )
}
