import { http, HttpResponse } from 'msw'
import type { SensorData } from '../../types'

// Mock data that matches your backend structure
const mockTemperatureData: SensorData[] = [
  { timestamp: '2026-01-16T08:00:00Z', value: 75 },
  { timestamp: '2026-01-16T08:05:00Z', value: 76 },
  { timestamp: '2026-01-16T08:10:00Z', value: 74 }
]

const mockPressureData: SensorData[] = [
  { timestamp: '2026-01-16T08:00:00Z', value: 120 },
  { timestamp: '2026-01-16T08:05:00Z', value: 122 },
  { timestamp: '2026-01-16T08:10:00Z', value: 119 }
]

const mockVibrationData: SensorData[] = [
  { timestamp: '2026-01-16T08:00:00Z', value: 0.5 },
  { timestamp: '2026-01-16T08:05:00Z', value: 0.6 },
  { timestamp: '2026-01-16T08:10:00Z', value: 0.4 }
]

const mockPowerData: SensorData[] = [
  { timestamp: '2026-01-16T08:00:00Z', value: 1200 },
  { timestamp: '2026-01-16T08:05:00Z', value: 1250 },
  { timestamp: '2026-01-16T08:10:00Z', value: 1180 }
]

const mockDataMap: Record<string, SensorData[]> = {
  temperature: mockTemperatureData,
  pressure: mockPressureData,
  vibration: mockVibrationData,
  power: mockPowerData
}

const VALID_METRICS = ['temperature', 'pressure', 'vibration', 'power']

// API handlers that match your backend routes
export const handlers = [
  // Get all metrics
  http.get('/api/metrics', () => {
    return HttpResponse.json({
      temperature: mockTemperatureData,
      pressure: mockPressureData,
      vibration: mockVibrationData,
      power: mockPowerData
    })
  }),

  // Get specific metric data - SUCCESS case
  http.get('/api/metrics/:metricType', ({ params }) => {
    const { metricType } = params

    // Validate metric type (matches backend behavior)
    if (!VALID_METRICS.includes(metricType as string)) {
      return HttpResponse.json(
        { 
          error: 'Invalid metric type',
          validTypes: VALID_METRICS 
        },
        { status: 400 }
      )
    }

    const data = mockDataMap[metricType as string]
    
    if (!data) {
      return HttpResponse.json(
        { error: 'Metric data not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(data)
  })
]

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Network error simulation
  http.get('/api/metrics/:metricType', () => {
    return HttpResponse.error()
  })
]

// 500 Server error handler
export const serverErrorHandlers = [
  http.get('/api/metrics/:metricType', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  })
]

// Export mock data for use in tests
export const mockData = {
  temperature: mockTemperatureData,
  pressure: mockPressureData,
  vibration: mockVibrationData,
  power: mockPowerData
}
