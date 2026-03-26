export interface SensorData {
  timestamp: string;
  value: number;
}

export type MetricType = 'temperature' | 'pressure' | 'vibration' | 'power';

export interface AllMetricsData {
  temperature: SensorData[];
  pressure: SensorData[];
  vibration: SensorData[];
  power: SensorData[];
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  validTypes?: MetricType[];
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  googleId: string;
  picture?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
}
