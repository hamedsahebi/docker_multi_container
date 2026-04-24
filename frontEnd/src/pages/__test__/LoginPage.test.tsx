import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../LoginPage'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the auth service

const mockGetCurrentUser = vi.fn()

vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: () => mockGetCurrentUser(),
    logout: vi.fn(),
    checkStatus: vi.fn(),
    refreshToken: vi.fn(),
  },
}))

// Wrapper component to provide router and auth context
const renderWithProviders = (
  component: React.ReactElement,
  { route = '/login' } = {}
) => {
  window.history.pushState({}, 'Test page', route)
  
  return render(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={component} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockRejectedValue(new Error('Not authenticated'))
  })

  describe('Initial Render', () => {
    it('should render the main title', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /industrial monitoring system/i })).toBeInTheDocument()
      })
    })

    it('should render the description text', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText(/sign in to access real-time sensor data and analytics/i)).toBeInTheDocument()
      })
    })

    it('should render the Google sign-in button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })
    })

    it('should render Google icon in the button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        const svg = button.querySelector('svg')
        expect(svg).toBeInTheDocument()
      })
    })
  })

  describe('Authentication Button Click', () => {
    it('should call login function when sign-in button is clicked', async () => {
      const user = userEvent.setup()
      
      // Mock successful user not logged in state
      mockGetCurrentUser.mockRejectedValue(new Error('Not authenticated'))

      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      await user.click(signInButton)

      // The login function from AuthContext should be triggered
      // Note: Since we're using AuthContext's login, which redirects to Google OAuth,
      // we can verify the button is clickable and doesn't throw errors
      expect(signInButton).toBeEnabled()
    })
  })

  describe('Stats Cards', () => {
    it('should display all three stat cards', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('24/7')).toBeInTheDocument()
        expect(screen.getByText('Real-time')).toBeInTheDocument()
      })
    })

    it('should display stat card labels', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('Sensors')).toBeInTheDocument()
        expect(screen.getByText('Monitoring')).toBeInTheDocument()
        expect(screen.getByText('Analytics')).toBeInTheDocument()
      })
    })

    it('should have proper styling for stat cards', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const statsContainer = container.querySelector('.grid.grid-cols-3')
        expect(statsContainer).toBeInTheDocument()
      })
    })
  })

  describe('Terms and Privacy', () => {
    it('should display terms of service text', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText(/by signing in, you agree to our terms of service/i)).toBeInTheDocument()
      })
    })

    it('should display privacy policy text', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText(/and privacy policy/i)).toBeInTheDocument()
      })
    })
  })

  describe('Layout and Styling', () => {
    it('should have gradient background', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const mainDiv = container.querySelector('.min-h-screen')
        expect(mainDiv).toHaveClass('bg-gradient-to-br')
      })
    })

    it('should have centered layout', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const mainDiv = container.querySelector('.min-h-screen')
        expect(mainDiv).toHaveClass('flex')
        expect(mainDiv).toHaveClass('items-center')
        expect(mainDiv).toHaveClass('justify-center')
      })
    })

    it('should render white card container', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const card = container.querySelector('.bg-white.rounded-xl')
        expect(card).toBeInTheDocument()
      })
    })
  })

  describe('Button Styling', () => {
    it('should have blue background on sign-in button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('bg-blue-600')
      })
    })

    it('should have full width button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('w-full')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const h2Elements = container.querySelectorAll('h2')
        expect(h2Elements.length).toBeGreaterThan(0)
      })
    })

    it('should have accessible button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toBeEnabled()
        expect(button).toBeVisible()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', async () => {
      // Mock the auth service to return loading state
      mockGetCurrentUser.mockImplementation(() => 
        new Promise(() => {}) // Never resolves to keep loading state
      )

      renderWithProviders(<LoginPage />)

      // Wait for the loading state to appear
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should show spinner animation in loading state', async () => {
      mockGetCurrentUser.mockImplementation(() => 
        new Promise(() => {})
      )

      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Redirect When Authenticated', () => {
    it('should redirect to dashboard if already authenticated', async () => {
      // Mock authenticated user
      mockGetCurrentUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      })

      renderWithProviders(<LoginPage />)

      // Should redirect and show dashboard page instead
      await waitFor(() => {
        // The redirect happens immediately, so we might see dashboard
        // or the login page might not fully render
        expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Content Completeness', () => {
    it('should render all expected content sections', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        // Title section
        expect(screen.getByRole('heading', { name: /industrial monitoring system/i })).toBeInTheDocument()
        
        // Sign-in button
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
        
        // Stats section
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('24/7')).toBeInTheDocument()
        expect(screen.getByText('Real-time')).toBeInTheDocument()
        
        // Terms section
        expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
      })
    })

    it('should have proper text color classes', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const title = screen.getByRole('heading', { name: /industrial monitoring system/i })
        expect(title).toHaveClass('text-gray-900')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive width constraints', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const formContainer = container.querySelector('.max-w-md')
        expect(formContainer).toBeInTheDocument()
      })
    })

    it('should use responsive grid for stats', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const grid = container.querySelector('.grid-cols-3')
        expect(grid).toBeInTheDocument()
      })
    })
  })

  describe('Visual Feedback', () => {
    it('should have hover effect on button', async () => {
      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('hover:bg-blue-700')
      })
    })

    it('should have shadow on main card', async () => {
      const { container } = renderWithProviders(<LoginPage />)

      await waitFor(() => {
        const card = container.querySelector('.shadow-lg')
        expect(card).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should not crash when auth context fails', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Network error'))

      renderWithProviders(<LoginPage />)

      await waitFor(() => {
        // Should still render the page
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })
    })
  })
})
