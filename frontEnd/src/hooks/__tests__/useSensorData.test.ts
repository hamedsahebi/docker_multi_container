import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSensorData } from '../useSensorData'
import type { MetricType, SensorData } from '../../types'

// Mock fetch globally
global.fetch = vi.fn()

describe('useSensorData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state initially', () => {
    // Mock fetch to never resolve
    ;(global.fetch as any).mockImplementation(() => new Promise(() => {}))

    const cache: Partial<Record<MetricType, SensorData[]>> = {}
    const setCache = vi.fn()

    const { result } = renderHook(() => useSensorData({ 
      metric: 'temperature', 
      cache, 
      setCache 
    }))

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toEqual([])
  })

  it('should fetch sensor data for specified metric successfully', async () => {
    const mockData = [
      { timestamp: '2026-01-16T08:00:00Z', value: 75 },
      { timestamp: '2026-01-16T08:05:00Z', value: 76 }
    ]

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData
    })

    const cache: Partial<Record<MetricType, SensorData[]>> = {}
    const setCache = vi.fn()

    const { result } = renderHook(() => useSensorData({ 
      metric: 'temperature', 
      cache, 
      setCache 
    }))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.data).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/temperature')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(setCache).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should fetch different metric when metric changes', async () => {
    const tempData = [{ timestamp: '2026-01-16T08:00:00Z', value: 75 }]
    const pressureData = [{ timestamp: '2026-01-16T08:00:00Z', value: 120 }]

    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => tempData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => pressureData
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

    expect(result.current.data).toEqual(tempData)
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/temperature')

    // Change to pressure
    rerender({ metric: 'pressure' })

    // Wait for loading to start
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(pressureData)
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/pressure')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should use cached data when switching back to previously fetched metric', async () => {
    const tempData = [{ timestamp: '2026-01-16T08:00:00Z', value: 75 }]
    const pressureData = [{ timestamp: '2026-01-16T08:00:00Z', value: 120 }]

    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => tempData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => pressureData
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

    expect(result.current.data).toEqual(tempData)

    // Switch to pressure
    rerender({ metric: 'pressure' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(pressureData)

    // Switch back to temperature - should use cache
    rerender({ metric: 'temperature' })

    // Should be immediately loaded from cache (no loading state)
    await waitFor(() => {
      expect(result.current.data).toEqual(tempData)
    })

    expect(result.current.loading).toBe(false)
    // Should still only have 2 fetch calls (not 3)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle fetch errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    const cache: Partial<Record<MetricType, SensorData[]>> = {}
    const setCache = vi.fn()

    const { result } = renderHook(() => useSensorData({ 
      metric: 'temperature', 
      cache, 
      setCache 
    }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
    expect(result.current.data).toEqual([])
    
    consoleErrorSpy.mockRestore()
  })

  it('should handle JSON parsing errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => { throw new Error('Invalid JSON') }
    })

    const cache: Partial<Record<MetricType, SensorData[]>> = {}
    const setCache = vi.fn()

    const { result } = renderHook(() => useSensorData({ 
      metric: 'pressure', 
      cache, 
      setCache 
    }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toEqual([])
    
    consoleErrorSpy.mockRestore()
  })
})
