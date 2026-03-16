import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MetricChart } from '../MetricChart'
import { MetricConfig, SensorData } from '../../types'

describe('MetricChart', () => {
  const mockMetric: MetricConfig = {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    color: '#ef4444',
    unit: '°C',
    domain: [60, 100]
  }

  const mockData: SensorData[] = [
    { timestamp: '2026-01-16T08:00:00Z', value: 75 },
    { timestamp: '2026-01-16T08:05:00Z', value: 76 },
    { timestamp: '2026-01-16T08:10:00Z', value: 74 }
  ]

  it('should render chart container with background styling', () => {
    const { container } = render(
      <MetricChart metric={mockMetric} data={mockData} />
    )

    const chartContainer = container.querySelector('.bg-white.rounded-xl.shadow-lg')
    expect(chartContainer).toBeInTheDocument()
  })

  it('should render ResponsiveContainer', () => {
    const { container } = render(
      <MetricChart metric={mockMetric} data={mockData} />
    )

    const responsiveContainer = container.querySelector('.recharts-responsive-container')
    expect(responsiveContainer).toBeTruthy()
  })

  it('should accept metric configuration props', () => {
    const { container } = render(
      <MetricChart metric={mockMetric} data={mockData} />
    )

    // Component should render without errors when given valid props
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle empty data array', () => {
    const { container } = render(
      <MetricChart metric={mockMetric} data={[]} />
    )

    // Should render container even with no data
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
  })

  it('should accept different metric configurations', () => {
    const pressureMetric: MetricConfig = {
      id: 'pressure',
      name: 'Pressure',
      icon: '💨',
      color: '#3b82f6',
      unit: 'PSI',
      domain: [120, 160]
    }

    const pressureData: SensorData[] = [
      { timestamp: '2026-01-16T08:00:00Z', value: 130 },
      { timestamp: '2026-01-16T08:05:00Z', value: 135 }
    ]

    const { container } = render(
      <MetricChart metric={pressureMetric} data={pressureData} />
    )

    // Should render without errors
    expect(container.firstChild).toBeTruthy()
  })

  it('should render with single data point', () => {
    const singleData: SensorData[] = [
      { timestamp: '2026-01-16T08:00:00Z', value: 75 }
    ]

    const { container } = render(
      <MetricChart metric={mockMetric} data={singleData} />
    )

    expect(container.firstChild).toBeTruthy()
  })

  it('should render with multiple data points', () => {
    const multipleData: SensorData[] = Array.from({ length: 20 }, (_, i) => ({
      timestamp: `2026-01-16T08:${i.toString().padStart(2, '0')}:00Z`,
      value: 70 + Math.random() * 20
    }))

    const { container } = render(
      <MetricChart metric={mockMetric} data={multipleData} />
    )

    expect(container.firstChild).toBeTruthy()
  })
})
