import { useState, useEffect, useCallback } from 'react'
import type { SensorData, MetricType } from '../types'

interface UseSensorDataReturn {
  data: SensorData[]
  loading: boolean
  error: Error | null
}

interface UseSensorDataProps {
  metric: MetricType
  cache: Partial<Record<MetricType, SensorData[]>>
  setCache: React.Dispatch<React.SetStateAction<Partial<Record<MetricType, SensorData[]>>>>
}

export const useSensorData = ({ metric, cache, setCache }: UseSensorDataProps): UseSensorDataReturn => {
  const [data, setData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetricData = useCallback(async (metricType: MetricType) => {
    // Check if data is already cached
    if (cache[metricType]) {
      setData(cache[metricType]!)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/metrics/${metricType}`)
      const jsonData = await response.json()
      
      // Cache the fetched data
      setCache(prevCache => ({
        ...prevCache,
        [metricType]: jsonData
      }))
      setData(jsonData)
    } catch (err) {
      console.error(`Error loading ${metricType} data:`, err)
      setError(err instanceof Error ? err : new Error(`Failed to load ${metricType} data`))
    } finally {
      setLoading(false)
    }
  }, [cache, setCache])

  useEffect(() => {
    fetchMetricData(metric)
  }, [metric, fetchMetricData])

  return {
    data,
    loading,
    error
  }
}
