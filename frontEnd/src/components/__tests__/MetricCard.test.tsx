import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MetricCard } from '../MetricCard'
import { MetricConfig } from '../../types'

describe('MetricCard', () => {
  const mockMetric: MetricConfig = {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    color: '#ef4444',
    unit: '°C',
    yAxisDomain: [60, 100]
  }

  it('should render metric information correctly', () => {
    const onClick = vi.fn()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.5}
        isActive={false}
        onClick={onClick}
      />
    )

    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('🌡️')).toBeInTheDocument()
    expect(screen.getByText('75.5 °C')).toBeInTheDocument()
  })

  it('should not render value when currentValue is null', () => {
    const onClick = vi.fn()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={null}
        isActive={false}
        onClick={onClick}
      />
    )

    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.5}
        isActive={false}
        onClick={onClick}
      />
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should show active state with checkmark icon', () => {
    const onClick = vi.fn()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.5}
        isActive={true}
        onClick={onClick}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-blue-500', 'bg-blue-50')
    
    // Check for checkmark SVG
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should not show checkmark icon when inactive', () => {
    const onClick = vi.fn()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.5}
        isActive={false}
        onClick={onClick}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-gray-200', 'bg-white')
    
    // Check for no checkmark SVG
    const svg = button.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('should format value with one decimal place', () => {
    const onClick = vi.fn()
    
    render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.567}
        isActive={false}
        onClick={onClick}
      />
    )

    expect(screen.getByText('75.6 °C')).toBeInTheDocument()
  })

  it('should apply correct color to value', () => {
    const onClick = vi.fn()
    
    const { container } = render(
      <MetricCard
        metric={mockMetric}
        currentValue={75.5}
        isActive={false}
        onClick={onClick}
      />
    )

    const valueElement = container.querySelector('[style*="color"]')
    expect(valueElement).toHaveStyle({ color: '#ef4444' })
  })
})
