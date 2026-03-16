import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RealTimeDashboard } from '../RealTimeDashboard'

// Mock fetch API
global.fetch = vi.fn()

const mockData = [
  { timestamp: '2026-01-28T00:00:00Z', value: 10 },
  { timestamp: '2026-01-28T00:00:02Z', value: 20 },
  { timestamp: '2026-01-28T00:00:04Z', value: 30 },
]

describe('RealTimeDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })


  it('should display loading state while fetching data', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<RealTimeDashboard />)

    // Check for loading state (shows full-screen "Loading data..." before sidebar appears)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
    })

    // Should show the sidebar with "Loading data progressively" after load
    expect(screen.getByText('Loading data progressively')).toBeInTheDocument()
  })

  it('should fetch and display data for the selected metric', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<RealTimeDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/temperature')
    expect(screen.getByText('Real-Time Monitor')).toBeInTheDocument()
  })

  it('should update chart with real-time data', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    // Set up fake timers before rendering
    vi.useFakeTimers()

    render(<RealTimeDashboard />)

    // Fast-forward through the initial loading (fetch is still mocked and will resolve)
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Now data is loaded, advance 2 seconds for first data point
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Check for first value (displayed with 1 decimal place)
    expect(screen.getByText('10.0')).toBeInTheDocument()

    // Advance timer to trigger second data point
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Check for second value
    expect(screen.getByText('20.0')).toBeInTheDocument()
  })

  it('should pause and resume real-time updates', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    vi.useFakeTimers()

    render(<RealTimeDashboard />)

    // Fast-forward through initial loading
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Advance to first data point
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('10.0')).toBeInTheDocument()

    // Pause updates
    act(() => {
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      pauseButton.click()
    })

    // Advance time - should not add new data point when paused
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should still show only first value
    expect(screen.getByText('10.0')).toBeInTheDocument()
    expect(screen.queryByText('20.0')).not.toBeInTheDocument()

    // Resume updates
    act(() => {
      const resumeButton = screen.getByRole('button', { name: /resume/i })
      resumeButton.click()
    })

    // Advance time - should now add next data point
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('20.0')).toBeInTheDocument()
  })

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<RealTimeDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
    })

    // Should show waiting state when no data is loaded
    expect(screen.getByText(/waiting for data/i)).toBeInTheDocument()
    
    consoleErrorSpy.mockRestore()
  })

  it('should switch between different metrics', async () => {
    const user = userEvent.setup()
    
    const tempData = [{ timestamp: '2026-01-28T00:00:00Z', value: 75 }]
    const pressureData = [{ timestamp: '2026-01-28T00:00:00Z', value: 130 }]

    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => tempData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => pressureData,
      })

    render(<RealTimeDashboard />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
    })

    // Verify temperature data was fetched
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/temperature')

    // Click on pressure metric card
    const pressureCard = screen.getByRole('button', { name: /pressure/i })
    await user.click(pressureCard)

    // Wait for pressure data to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/metrics/pressure')
    })
  })

  it('should display metric cards for all available metrics', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<RealTimeDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
    })

    // Check that all 4 metric cards are rendered
    expect(screen.getByRole('button', { name: /temperature/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pressure/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vibration/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /power/i })).toBeInTheDocument()
  })
})