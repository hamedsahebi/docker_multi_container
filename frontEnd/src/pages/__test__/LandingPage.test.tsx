import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LandingPage } from '../LandingPage'

// Wrapper component to provide router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LandingPage', () => {
  describe('Hero Section', () => {
    it('should render the main title', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByRole('heading', { name: /compressor monitor/i, level: 1 })).toBeInTheDocument()
    })

    it('should render the hero icon', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText('🏭')).toBeInTheDocument()
    })

    it('should render the description', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText(/industrial compressor monitoring dashboard/i)).toBeInTheDocument()
    })
  })

  describe('Dashboard Cards', () => {
    it('should render both dashboard cards', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByRole('heading', { name: /historical data/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /real-time monitoring/i })).toBeInTheDocument()
    })

    it('should have correct links for historical dashboard', () => {
      renderWithRouter(<LandingPage />)
      
      const historicalLink = screen.getByRole('link', { name: /historical data/i })
      expect(historicalLink).toHaveAttribute('href', '/historical')
    })

    it('should have correct links for real-time dashboard', () => {
      renderWithRouter(<LandingPage />)
      
      const realtimeLink = screen.getByRole('link', { name: /real-time monitoring/i })
      expect(realtimeLink).toHaveAttribute('href', '/realtime')
    })

    it('should render dashboard card descriptions', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText(/analyze past performance with comprehensive historical charts/i)).toBeInTheDocument()
      expect(screen.getByText(/monitor live sensor data with instant updates/i)).toBeInTheDocument()
    })

    it('should render dashboard icons', () => {
      renderWithRouter(<LandingPage />)
      
      const icons = screen.getAllByText('📊')
      expect(icons.length).toBeGreaterThan(0)
      
      const realtimeIcons = screen.getAllByText('⚡')
      expect(realtimeIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Metrics Overview Section', () => {
    it('should render metrics section title', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByRole('heading', { name: /monitored metrics/i })).toBeInTheDocument()
    })

    it('should render all four metric cards', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByRole('heading', { name: /^temperature$/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^pressure$/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^vibration$/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^power$/i })).toBeInTheDocument()
    })

    it('should render metric descriptions', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText(/monitor compressor temperature levels/i)).toBeInTheDocument()
      expect(screen.getByText(/track pressure variations in real-time/i)).toBeInTheDocument()
      expect(screen.getByText(/detect anomalies through vibration analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/optimize energy consumption and efficiency/i)).toBeInTheDocument()
    })

    it('should render metric icons', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText('🌡️')).toBeInTheDocument()
      expect(screen.getByText('📳')).toBeInTheDocument()
      expect(screen.getByText('🔋')).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('should render footer text', () => {
      renderWithRouter(<LandingPage />)
      
      expect(screen.getByText(/powered by react \+ typescript \+ vite/i)).toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper semantic structure', () => {
      const { container } = renderWithRouter(<LandingPage />)
      
      // Check for main headings
      const h1Elements = container.querySelectorAll('h1')
      expect(h1Elements.length).toBe(1)
      
      // Check for links
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThanOrEqual(2)
    })

    it('should have gradient background on main container', () => {
      const { container } = renderWithRouter(<LandingPage />)
      
      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveClass('min-h-screen')
      expect(mainDiv).toHaveClass('bg-[#0a0e27]')
    })
  })

  describe('Accessibility', () => {
    it('should have all links accessible', () => {
      renderWithRouter(<LandingPage />)
      
      const historicalLink = screen.getByRole('link', { name: /historical data/i })
      const realtimeLink = screen.getByRole('link', { name: /real-time monitoring/i })
      
      expect(historicalLink).toBeVisible()
      expect(realtimeLink).toBeVisible()
    })

    it('should have proper heading hierarchy', () => {
      const { container } = renderWithRouter(<LandingPage />)
      
      const h1 = container.querySelector('h1')
      const h2Elements = container.querySelectorAll('h2')
      const h3Elements = container.querySelectorAll('h3')
      
      expect(h1).toBeInTheDocument()
      expect(h2Elements.length).toBeGreaterThan(0)
      expect(h3Elements.length).toBe(4) // Four metric names
    })
  })

  describe('Content Completeness', () => {
    it('should render all expected text content', () => {
      renderWithRouter(<LandingPage />)
      
      // All main sections should be present
      expect(screen.getByRole('heading', { name: /compressor monitor/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /historical data/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /real-time monitoring/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /monitored metrics/i })).toBeInTheDocument()
    })

    it('should have "Open Dashboard" call-to-action text', () => {
      renderWithRouter(<LandingPage />)
      
      const ctaElements = screen.getAllByText(/open dashboard/i)
      expect(ctaElements).toHaveLength(2) // One for each dashboard card
    })
  })
})
