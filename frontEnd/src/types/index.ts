export interface SensorData {
  timestamp: string
  value: number
}

export type MetricType = 'temperature' | 'pressure' | 'vibration' | 'power'

export interface MetricConfig {
  id: MetricType
  name: string
  unit: string
  icon: string
  color: string
  domain: [number, number]
}
