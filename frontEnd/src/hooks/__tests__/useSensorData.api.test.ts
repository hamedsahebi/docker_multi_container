import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSensorData } from '../useSensorData'
import type { MetricType, SensorData } from '../../types'

// Mock environment variables
const MOCK_API_URL = 'http://localhost:5000'
vi.stubEnv('VITE_API_URL', MOCK_API_URL)

// Mock fetch globally
global.fetch = vi.fn()

// Mock data that matches backend structure
const mockData = {
  temperature: [
    { timestamp: '2026-01-16T08:00:00Z', value: 75 },
    { timestamp: '2026-01-16T08:05:00Z', value: 76 },
    { timestamp: '2026-01-16T08:10:00Z', value: 74 }
  ],
  pressure: [
    { timestamp: '2026-01-16T08:00:00Z', value: 120 },
    { timestamp: '2026-01-16T08:05:00Z', value: 122 },
    { timestamp: '2026-01-16T08:10:00Z', value: 119 }
  ],
  vibration: [
    { timestamp: '2026-01-16T08:00:00Z', value: 0.5 },
    { timestamp: '2026-01-16T08:05:00Z', value: 0.6 },
    { timestamp: '2026-01-16T08:10:00Z', value: 0.4 }
  ],
  power: [
    { timestamp: '2026-01-16T08:00:00Z', value: 1200 },
    { timestamp: '2026-01-16T08:05:00Z', value: 1250 },
    { timestamp: '2026-01-16T08:10:00Z', value: 1180 }
  ]
}

describe('useSensorData - Comprehensive API Communication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful API Communication', () => {
    it('should fetch temperature data from API endpoint successfully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData.temperature
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual(mockData.temperature)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/temperature`, { credentials: "include", headers: { "Content-Type": "application/json" } })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(setCache).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should fetch pressure data from API endpoint successfully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData.pressure
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'pressure', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual(mockData.pressure)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/pressure`, { credentials: "include", headers: { "Content-Type": "application/json" } })
    })

    it('should fetch vibration data from API endpoint successfully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData.vibration
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'vibration', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual(mockData.vibration)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/vibration`, { credentials: "include", headers: { "Content-Type": "application/json" } })
    })

    it('should fetch power data from API endpoint successfully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData.power
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'power', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual(mockData.power)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/power`, { credentials: "include", headers: { "Content-Type": "application/json" } })
    })
  })

  describe('Metric Switching and Caching', () => {
    it('should fetch different metric when metric changes', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData.temperature
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData.pressure
        })

      let cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn((updater) => {
        cache = typeof updater === 'function' ? updater(cache) : updater
      })

      const { result, rerender } = renderHook(
        ({ metric }: { metric: MetricType }) => useSensorData({ metric, cache, setCache }),
        { initialProps: { metric: 'temperature' as MetricType } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData.temperature)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/temperature`, { credentials: "include", headers: { "Content-Type": "application/json" } })

      // Change to pressure
      rerender({ metric: 'pressure' })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData.pressure)
      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/metrics/pressure`, { credentials: "include", headers: { "Content-Type": "application/json" } })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should use cached data when switching back to previously fetched metric', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData.temperature
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData.pressure
        })

      let cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn((updater) => {
        cache = typeof updater === 'function' ? updater(cache) : updater
      })

      const { result, rerender } = renderHook(
        ({ metric }: { metric: MetricType }) => useSensorData({ metric, cache, setCache }),
        { initialProps: { metric: 'temperature' as MetricType } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData.temperature)

      // Switch to pressure
      rerender({ metric: 'pressure' })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData.pressure)

      // Switch back to temperature - should use cache
      rerender({ metric: 'temperature' })

      // Should be immediately loaded from cache (no loading state)
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual(mockData.temperature)
      // Should still only have 2 fetch calls (not 3)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling - HTTP Errors', () => {
    it('should handle 400 Bad Request error from backend', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      ;(global.fetch as any).mockRejectedValue(
        new Error('400 Bad Request: Invalid metric type')
      )

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('400')
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle 404 Not Found error when metric data is missing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(
        new Error('404 Not Found: Metric data not found')
      )

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('404')
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle 500 Internal Server Error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(
        new Error('500 Internal Server Error')
      )

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'pressure', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('500')
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error Handling - Network Errors', () => {
    it('should handle network failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle timeout scenario', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(new Error('Request timeout'))

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'vibration', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Request timeout')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle DNS resolution failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(
        new Error('getaddrinfo ENOTFOUND')
      )

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'power', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Response Validation', () => {
    it('should handle malformed JSON response', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'power', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.data).toEqual([])
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle empty array response', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => []
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual([])
    })

    it('should handle response with correct data structure', async () => {
      const customData = [
        { timestamp: '2026-03-18T10:00:00Z', value: 99.5 },
        { timestamp: '2026-03-18T10:05:00Z', value: 100.2 }
      ]

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => customData
      })

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual(customData)
      expect(result.current.data[0]).toHaveProperty('timestamp')
      expect(result.current.data[0]).toHaveProperty('value')
      expect(typeof result.current.data[0].timestamp).toBe('string')
      expect(typeof result.current.data[0].value).toBe('number')
    })
  })

  describe('Loading States', () => {
    it('should return loading state initially', async () => {
      ;(global.fetch as any).mockImplementation(() => new Promise(() => {}))

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual([])
    })

    it('should not show loading state when using cached data', async () => {
      const cache: Partial<Record<MetricType, SensorData[]>> = {
        temperature: mockData.temperature
      }
      const setCache = vi.fn()

      const { result } = renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      // Should immediately have data from cache, no loading
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual(mockData.temperature)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Cache Management', () => {
    it('should update cache after successful fetch', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData.temperature
      })

      let cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn((updater) => {
        cache = typeof updater === 'function' ? updater(cache) : updater
      })

      renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(setCache).toHaveBeenCalled()
      })

      // Verify cache was updated with temperature data
      const updateFunction = setCache.mock.calls[0][0]
      const updatedCache = updateFunction({})
      expect(updatedCache.temperature).toEqual(mockData.temperature)
    })

    it('should not update cache on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const cache: Partial<Record<MetricType, SensorData[]>> = {}
      const setCache = vi.fn()

      renderHook(() => 
        useSensorData({ 
          metric: 'temperature', 
          cache, 
          setCache 
        })
      )

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      // setCache should not have been called on error
      expect(setCache).not.toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('API Endpoint Structure', () => {
    it('should call correct API endpoint for each metric type', async () => {
      const metrics: MetricType[] = ['temperature', 'pressure', 'vibration', 'power']
      
      for (const metric of metrics) {
        vi.clearAllMocks()
        
        ;(global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockData[metric]
        })

        const cache: Partial<Record<MetricType, SensorData[]>> = {}
        const setCache = vi.fn()

        const { result } = renderHook(() => 
          useSensorData({ 
            metric, 
            cache, 
            setCache 
          })
        )

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(global.fetch).toHaveBeenCalledWith(
          `${MOCK_API_URL}/api/metrics/${metric}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    })
  })
})
