import { MetricConfig } from '../types'

interface MetricCardProps {
  metric: MetricConfig
  currentValue: number | null
  isActive: boolean
  onClick: () => void
}

export const MetricCard = ({ metric, currentValue, isActive, onClick }: MetricCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{metric.icon}</span>
            <span className="font-semibold text-gray-700">{metric.name}</span>
          </div>
          {currentValue !== null && (
            <div className="text-2xl font-bold" style={{ color: metric.color }}>
              {currentValue.toFixed(1)} {metric.unit}
            </div>
          )}
        </div>
        {isActive && (
          <div className="text-blue-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
