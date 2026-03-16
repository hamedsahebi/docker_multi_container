import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MetricConfig, SensorData } from '../types'
import { formatTime } from '../utils/formatters'

interface MetricChartProps {
  metric: MetricConfig
  data: SensorData[]
}

export const MetricChart = ({ metric, data }: MetricChartProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={metric.domain} />
          <Tooltip labelFormatter={formatTime} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={metric.color}
            strokeWidth={3}
            name={`${metric.name} (${metric.unit})`}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
