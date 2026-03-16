import { MetricConfig } from '../types'

export const metrics: MetricConfig[] = [
  { 
    id: 'temperature', 
    name: 'Temperature', 
    unit: '°C', 
    icon: '🌡️', 
    color: '#ef4444', 
    domain: [70, 90] 
  },
  { 
    id: 'pressure', 
    name: 'Pressure', 
    unit: 'PSI', 
    icon: '⚡', 
    color: '#3b82f6', 
    domain: [120, 155] 
  },
  { 
    id: 'vibration', 
    name: 'Vibration', 
    unit: 'mm/s', 
    icon: '📳', 
    color: '#f59e0b', 
    domain: [0, 10] 
  },
  { 
    id: 'power', 
    name: 'Power', 
    unit: 'kW', 
    icon: '🔋', 
    color: '#10b981', 
    domain: [15, 30] 
  }
]
