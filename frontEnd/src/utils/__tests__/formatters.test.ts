import { describe, it, expect } from 'vitest'
import { formatTime } from '../formatters'

describe('formatTime', () => {
  it('should format timestamp to HH:MM format', () => {
    const timestamp = '2026-01-16T08:30:00Z'
    const result = formatTime(timestamp)
    
    // Result will vary by timezone, but should match HH:MM format
    expect(result).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/)
  })

  it('should handle different timestamps correctly', () => {
    const timestamp1 = '2026-01-16T14:45:00Z'
    const timestamp2 = '2026-01-16T09:15:00Z'
    
    const result1 = formatTime(timestamp1)
    const result2 = formatTime(timestamp2)
    
    expect(result1).toBeTruthy()
    expect(result2).toBeTruthy()
    expect(result1).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/)
    expect(result2).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/)
  })

  it('should handle midnight', () => {
    const timestamp = '2026-01-16T00:00:00Z'
    const result = formatTime(timestamp)
    
    expect(result).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/)
  })

  it('should handle noon', () => {
    const timestamp = '2026-01-16T12:00:00Z'
    const result = formatTime(timestamp)
    
    expect(result).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/)
  })

  it('should return consistent format for same input', () => {
    const timestamp = '2026-01-16T15:30:00Z'
    const result1 = formatTime(timestamp)
    const result2 = formatTime(timestamp)
    
    expect(result1).toBe(result2)
  })
})
