import { getScoreColor } from '../../lib/utils'

interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { radius: 35, circumference: 220, fontSize: 'text-sm' },
    md: { radius: 50, circumference: 314, fontSize: 'text-2xl' },
    lg: { radius: 70, circumference: 440, fontSize: 'text-4xl' },
  }

  const config = sizeConfig[size]
  const strokeDashoffset = config.circumference - (score / 100) * config.circumference

  return (
    <div className="flex items-center justify-center">
      <svg
        width={config.radius * 2}
        height={config.radius * 2}
        className="transform -rotate-90"
      >
        <circle
          cx={config.radius}
          cy={config.radius}
          r={config.radius - 5}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={config.radius}
          cy={config.radius}
          r={config.radius - 5}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={config.circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-500 ${getScoreColor(score)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className={`font-bold ${config.fontSize} ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-xs text-gray-600">/ 100</div>
      </div>
    </div>
  )
}
