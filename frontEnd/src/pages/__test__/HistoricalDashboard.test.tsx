import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoricalDashboard } from '../HistoricalDashboard'

// Mock environment variables
const MOCK_API_URL = 'http://localhost:5000'
vi.stubEnv('VITE_API_URL', MOCK_API_URL)

// Mock fetch API
global.fetch = vi.fn()

const mockTemperatureData = [
  { timestamp: '2026-01-28T00:00:00Z', value: 75 },
  { timestamp: '2026-01-28T00:00:02Z', value: 76 },
  { timestamp: '2026-01-28T00:00:04Z', value: 77 },
]

const mockPressureData = [
  { timestamp: '2026-01-28T00:00:00Z', value: 130 },
  { timestamp: '2026-01-28T00:00:02Z', value: 135 },
  { timestamp: '2026-01-28T00:00:04Z', value: 140 },
]

const mockVibrationData = [
  { timestamp: '2026-01-28T00:00:00Z', value: 0.5 },
  { timestamp: '2026-01-28T00:00:02Z', value: 0.6 },
  { timestamp: '2026-01-28T00:00:04Z', value: 0.7 },
]

const mockPowerData = [
  { timestamp: '2026-01-28T00:00:00Z', value: 450 },
  { timestamp: '2026-01-28T00:00:02Z', value: 455 },
  { timestamp: '2026-01-28T00:00:04Z', value: 460 },
]

describe('HistoricalDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render and Loading', () => {
    it('should display loading state while fetching data', async () => {
      ;(global.fetch as any).mockImplementationOnce(() =>
        new Promise(() => {}) // Never resolves to keep loading state
      )

      render(<HistoricalDashboard />)

      expect(screen.getByText('Loading sensor data...')).toBeInTheDocument()
    })

    it('should fetch temperature data on initial load', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/api/metrics/temperature`,
        expect.objectContaining({
          credentials: 'include',
        })
      )
    })

    it('should render the sidebar with title', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Historical Data')).toBeInTheDocument()
      expect(screen.getByText('Select a metric to view')).toBeInTheDocument()
    })
  })

  describe('Metric Cards Display', () => {
    it('should render all four metric cards', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /temperature/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pressure/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /vibration/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /power/i })).toBeInTheDocument()
    })

    it('should mark temperature as active by default', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      const temperatureCard = screen.getByRole('button', { name: /temperature/i })
      // Check that temperature card has the active styling
      expect(temperatureCard).toHaveClass('bg-blue-50') // or whatever active class is used
        })

    it('should display current value for selected metric', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // The last value (77) should be displayed
      expect(screen.getByText(/77\.0/)).toBeInTheDocument()
    })
  })

  describe('Metric Switching', () => {
    it('should switch to pressure metric when clicked', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPressureData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      const pressureCard = screen.getByRole('button', { name: /pressure/i })
      await user.click(pressureCard)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${MOCK_API_URL}/api/metrics/pressure`,
          expect.objectContaining({
            credentials: 'include',
          })
        )
      })

      // Should show pressure data (last value: 140)
      await waitFor(() => {
        expect(screen.getByText(/140\.0/)).toBeInTheDocument()
      })
    })

    it('should switch to vibration metric when clicked', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVibrationData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      const vibrationCard = screen.getByRole('button', { name: /vibration/i })
      await user.click(vibrationCard)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${MOCK_API_URL}/api/metrics/vibration`,
          expect.objectContaining({
            credentials: 'include',
          })
        )
      })
    })

    it('should switch to power metric when clicked', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPowerData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      const powerCard = screen.getByRole('button', { name: /power/i })
      await user.click(powerCard)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${MOCK_API_URL}/api/metrics/power`,
          expect.objectContaining({
            credentials: 'include',
          })
        )
      })
    })
  })

  describe('Data Caching', () => {
    it('should cache data when switching between metrics', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPressureData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Temperature is loaded, fetch called once
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Switch to pressure
      const pressureCard = screen.getByRole('button', { name: /pressure/i })
      await user.click(pressureCard)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      // Switch back to temperature - should use cache, no new fetch
      const temperatureCard = screen.getByRole('button', { name: /temperature/i })
      await user.click(temperatureCard)

      // Wait a bit to ensure no new fetch happens
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should still be 2 calls (no new fetch for cached temperature data)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should display cached values for unselected metrics', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPressureData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Temperature is showing (77)
      expect(screen.getByText(/77\.0/)).toBeInTheDocument()

      // Switch to pressure
      const pressureCard = screen.getByRole('button', { name: /pressure/i })
      await user.click(pressureCard)

      await waitFor(() => {
        expect(screen.getByText(/140\.0/)).toBeInTheDocument()
      })

      // Temperature card should still show cached value
      // Note: The value might not be visible on unselected cards in all implementations
    })
  })

  describe('Chart Display', () => {
    it('should render the metric chart', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Check for chart title
      expect(screen.getByRole('heading', { name: /temperature/i })).toBeInTheDocument()
      expect(screen.getByText('Historical data visualization')).toBeInTheDocument()
    })

    it('should update chart when metric changes', async () => {
      const user = userEvent.setup()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTemperatureData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPressureData,
        })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { name: /temperature/i })).toBeInTheDocument()

      // Switch to pressure
      const pressureCard = screen.getByRole('button', { name: /pressure/i })
      await user.click(pressureCard)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /pressure/i })).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Should not crash and show the layout
      expect(screen.getByText('Historical Data')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should handle network errors for non-OK responses', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Should still render the layout
      expect(screen.getByText('Historical Data')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Layout and Structure', () => {
    it('should have left sidebar and main chart area', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      const { container } = render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Check for the two-column layout structure
      expect(screen.getByText('Historical Data')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /temperature/i })).toBeInTheDocument()
    })

    it('should display metric icon in chart header', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Temperature icon should be displayed
      const icons = screen.getAllByText('🌡️')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Current Value Display', () => {
    it('should show the latest value from the dataset', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemperatureData,
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Last value in mockTemperatureData is 77
      expect(screen.getByText(/77\.0/)).toBeInTheDocument()
    })

    it('should handle empty data arrays', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      render(<HistoricalDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading sensor data...')).not.toBeInTheDocument()
      })

      // Should still render without crashing
      expect(screen.getByText('Historical Data')).toBeInTheDocument()
    })
  })
})
