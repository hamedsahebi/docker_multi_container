import { useState, useEffect } from 'react'
import type { MetricType, SensorData } from '../types'
import { metrics } from '../constants/metrics'
import { MetricCard } from '../components/MetricCard'
import { MetricChart } from '../components/MetricChart'

const MAX_DATA_POINTS = 30 // Keep last 30 data points visible

export function RealTimeDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature')
  const [fullData, setFullData] = useState<SensorData[]>([]) // Complete dataset from JSON
  const [displayData, setDisplayData] = useState<SensorData[]>([]) // Data to display (incremental)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [loading, setLoading] = useState(true)

  // Load full dataset when metric changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setDisplayData([]) // Reset display
      setCurrentIndex(0) // Reset index
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${apiUrl}/api/metrics/${selectedMetric}`)
        if (!response.ok) throw new Error(`Failed to fetch ${selectedMetric} data`)
        const data: SensorData[] = await response.json()
        setFullData(data)
      } catch (error) {
        console.error(`Error loading ${selectedMetric} data:`, error)
        setFullData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedMetric])

  // Incrementally reveal data points
  useEffect(() => {
    if (!isRunning || loading || currentIndex >= fullData.length) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex <= fullData.length) {
          // Add next data point from full dataset
          setDisplayData(fullData.slice(Math.max(0, nextIndex - MAX_DATA_POINTS), nextIndex))
          return nextIndex
        }
        return prev
      })
    }, 2000) // Add new point every 2 seconds

    return () => clearInterval(interval)
  }, [isRunning, loading, currentIndex, fullData])

  const currentMetric = metrics.find(m => m.id === selectedMetric)!
  const currentValue = displayData.length > 0 ? displayData[displayData.length - 1].value : null
  const lastUpdate = displayData.length > 0 ? new Date(displayData[displayData.length - 1].timestamp) : null
  const progress = fullData.length > 0 ? Math.round((currentIndex / fullData.length) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">Real-Time Monitor</h2>
            <div className="flex items-center gap-2">
              {isRunning && currentIndex < fullData.length && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              )}
              {currentIndex >= fullData.length && fullData.length > 0 && (
                <span className="text-xs text-gray-500">Complete</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">Loading data progressively</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={currentIndex >= fullData.length}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              currentIndex >= fullData.length
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {currentIndex >= fullData.length ? '✓ Complete' : isRunning ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>

        <div className="space-y-3">
          {metrics.map((metric) => {
            const isActive = selectedMetric === metric.id
            const value = isActive && currentValue !== null ? currentValue : null
            
            return (
              <div key={metric.id}>
                <MetricCard
                  metric={metric}
                  currentValue={value}
                  isActive={isActive}
                  onClick={() => setSelectedMetric(metric.id)}
                />
                {isActive && (
                  <div className="text-xs text-gray-500 mt-1 ml-2">
                    {currentIndex} / {fullData.length} points ({progress}%)
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {lastUpdate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span>{currentMetric.icon}</span>
                {currentMetric.name}
              </h2>
              <p className="text-gray-600 mt-1">Real-time monitoring</p>
            </div>
            
            {currentValue !== null && (
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-800">
                  {currentValue.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">{currentMetric.unit}</div>
              </div>
            )}
          </div>
        </div>

        {displayData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">Waiting for data...</div>
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <MetricChart
              data={displayData}
              metric={currentMetric}
            />

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-2xl font-bold text-gray-800">
                  {currentValue?.toFixed(2)} {currentMetric.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Min (Displayed)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.min(...displayData.map(d => d.value)).toFixed(2)} {currentMetric.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max (Displayed)</div>
                <div className="text-2xl font-bold text-red-600">
                  {Math.max(...displayData.map(d => d.value)).toFixed(2)} {currentMetric.unit}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
