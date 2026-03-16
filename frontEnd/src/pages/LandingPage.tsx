import { Link } from 'react-router-dom'

export function LandingPage() {
  const features = [
    {
      icon: '📊',
      title: 'Historical Data',
      description: 'Analyze past performance with comprehensive historical charts and trends',
      path: '/historical'
    },
    {
      icon: '⚡',
      title: 'Real-Time Monitoring',
      description: 'Monitor live sensor data with instant updates and alerts',
      path: '/realtime'
    }
  ]

  const metrics = [
    { icon: '🌡️', name: 'Temperature', description: 'Monitor compressor temperature levels' },
    { icon: '⚡', name: 'Pressure', description: 'Track pressure variations in real-time' },
    { icon: '📳', name: 'Vibration', description: 'Detect anomalies through vibration analysis' },
    { icon: '🔋', name: 'Power', description: 'Optimize energy consumption and efficiency' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0e27]">
      {/* Circuit Board Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Strong glow filter */}
            <filter id="megaGlow">
              <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Central Massive Glowing Orb */}
          <g>
            {/* Outer glow layers */}
            <circle cx="600" cy="400" r="200" fill="#1e40af" opacity="0.1" filter="url(#megaGlow)" />
            <circle cx="600" cy="400" r="180" fill="#2563eb" opacity="0.15" filter="url(#megaGlow)" />
            <circle cx="600" cy="400" r="160" fill="#3b82f6" opacity="0.2" filter="url(#megaGlow)" className="animate-orb-expand" />
            
            {/* Core orb */}
            <circle cx="600" cy="400" r="140" fill="#1e40af" opacity="0.4" filter="url(#megaGlow)" />
            <circle cx="600" cy="400" r="120" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" className="animate-core-pulse" />
            <circle cx="600" cy="400" r="100" fill="#3b82f6" opacity="0.8" filter="url(#megaGlow)" />
            <circle cx="600" cy="400" r="80" fill="#60a5fa" opacity="0.9" className="animate-inner-glow" />
            <circle cx="600" cy="400" r="60" fill="#93c5fd" filter="url(#megaGlow)" />
            
            {/* Bright center */}
            <circle cx="600" cy="400" r="40" fill="#dbeafe" opacity="0.95" />
            <circle cx="600" cy="400" r="25" fill="#ffffff" />
          </g>

          {/* Left Circuit Traces */}
          <g>
            {/* Top left trace */}
            <rect x="50" y="295" width="350" height="8" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="50" y="297" width="350" height="4" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
            
            {/* Middle upper left trace */}
            <rect x="80" y="345" width="320" height="6" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="80" y="346" width="320" height="3" fill="#60a5fa" filter="url(#megaGlow)" className="animate-trace-glow-delayed" />
            
            {/* Center left trace - main */}
            <rect x="50" y="395" width="350" height="10" fill="#2563eb" opacity="0.7" filter="url(#megaGlow)" />
            <rect x="50" y="396" width="350" height="6" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
            
            {/* Middle lower left trace */}
            <rect x="80" y="450" width="320" height="6" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="80" y="451" width="320" height="3" fill="#60a5fa" filter="url(#megaGlow)" className="animate-trace-glow-delayed" />
            
            {/* Bottom left trace */}
            <rect x="50" y="495" width="350" height="8" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="50" y="497" width="350" height="4" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
          </g>

          {/* Right Circuit Traces */}
          <g>
            {/* Top right trace */}
            <rect x="800" y="295" width="350" height="8" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="800" y="297" width="350" height="4" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
            
            {/* Middle upper right trace */}
            <rect x="800" y="345" width="320" height="6" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="800" y="346" width="320" height="3" fill="#60a5fa" filter="url(#megaGlow)" className="animate-trace-glow-delayed" />
            
            {/* Center right trace - main */}
            <rect x="800" y="395" width="350" height="10" fill="#2563eb" opacity="0.7" filter="url(#megaGlow)" />
            <rect x="800" y="396" width="350" height="6" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
            
            {/* Middle lower right trace */}
            <rect x="800" y="450" width="320" height="6" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="800" y="451" width="320" height="3" fill="#60a5fa" filter="url(#megaGlow)" className="animate-trace-glow-delayed" />
            
            {/* Bottom right trace */}
            <rect x="800" y="495" width="350" height="8" fill="#2563eb" opacity="0.6" filter="url(#megaGlow)" />
            <rect x="800" y="497" width="350" height="4" fill="#3b82f6" filter="url(#megaGlow)" className="animate-trace-glow" />
          </g>

          {/* Connection Nodes - Left */}
          <g>
            <circle cx="150" cy="299" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="150" cy="299" r="6" fill="#3b82f6" />
            <circle cx="150" cy="299" r="3" fill="#93c5fd" />
            
            <circle cx="250" cy="299" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="250" cy="299" r="6" fill="#3b82f6" />
            <circle cx="250" cy="299" r="3" fill="#93c5fd" />
            
            <circle cx="180" cy="348" r="7" fill="#1e40af" opacity="0.8" />
            <circle cx="180" cy="348" r="5" fill="#60a5fa" />
            
            <circle cx="150" cy="400" r="9" fill="#1e40af" opacity="0.9" />
            <circle cx="150" cy="400" r="7" fill="#3b82f6" />
            <circle cx="150" cy="400" r="4" fill="#dbeafe" />
            
            <circle cx="300" cy="400" r="9" fill="#1e40af" opacity="0.9" />
            <circle cx="300" cy="400" r="7" fill="#3b82f6" />
            <circle cx="300" cy="400" r="4" fill="#dbeafe" />
            
            <circle cx="200" cy="453" r="7" fill="#1e40af" opacity="0.8" />
            <circle cx="200" cy="453" r="5" fill="#60a5fa" />
            
            <circle cx="250" cy="499" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="250" cy="499" r="6" fill="#3b82f6" />
            <circle cx="250" cy="499" r="3" fill="#93c5fd" />
          </g>

          {/* Connection Nodes - Right */}
          <g>
            <circle cx="900" cy="299" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="900" cy="299" r="6" fill="#3b82f6" />
            <circle cx="900" cy="299" r="3" fill="#93c5fd" />
            
            <circle cx="1000" cy="299" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="1000" cy="299" r="6" fill="#3b82f6" />
            <circle cx="1000" cy="299" r="3" fill="#93c5fd" />
            
            <circle cx="950" cy="348" r="7" fill="#1e40af" opacity="0.8" />
            <circle cx="950" cy="348" r="5" fill="#60a5fa" />
            
            <circle cx="900" cy="400" r="9" fill="#1e40af" opacity="0.9" />
            <circle cx="900" cy="400" r="7" fill="#3b82f6" />
            <circle cx="900" cy="400" r="4" fill="#dbeafe" />
            
            <circle cx="1050" cy="400" r="9" fill="#1e40af" opacity="0.9" />
            <circle cx="1050" cy="400" r="7" fill="#3b82f6" />
            <circle cx="1050" cy="400" r="4" fill="#dbeafe" />
            
            <circle cx="950" cy="453" r="7" fill="#1e40af" opacity="0.8" />
            <circle cx="950" cy="453" r="5" fill="#60a5fa" />
            
            <circle cx="1000" cy="499" r="8" fill="#1e40af" opacity="0.8" />
            <circle cx="1000" cy="499" r="6" fill="#3b82f6" />
            <circle cx="1000" cy="499" r="3" fill="#93c5fd" />
          </g>

          {/* Flowing data particles */}
          <g>
            <circle cx="100" cy="299" r="3" fill="#dbeafe" className="animate-data-flow-left-1" />
            <circle cx="100" cy="400" r="4" fill="#ffffff" className="animate-data-flow-left-2" />
            <circle cx="100" cy="499" r="3" fill="#dbeafe" className="animate-data-flow-left-3" />
            <circle cx="1100" cy="299" r="3" fill="#dbeafe" className="animate-data-flow-right-1" />
            <circle cx="1100" cy="400" r="4" fill="#ffffff" className="animate-data-flow-right-2" />
            <circle cx="1100" cy="499" r="3" fill="#dbeafe" className="animate-data-flow-right-3" />
          </g>
        </svg>

        {/* Enhanced atmospheric glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px]"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-6xl">🏭</span>
            <h1 className="text-5xl font-bold text-cyan-400">
              Compressor Monitor
            </h1>
          </div>
          <p className="text-xl text-200 max-w-2xl mx-auto">
            Industrial Compressor Monitoring Dashboard for real-time insights and historical analysis
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="group opacity-90 bg-gray-700 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 p-8 border-2 border-cyan-500/70 hover:border-cyan-400 hover:-translate-y-1 hover:opacity-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h2>
                <p className="text-gray-200 mb-6">
                  {feature.description}
                </p>
                <span className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                  Open Dashboard
                  <span className="text-xl">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Metrics Overview */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">
            Monitored Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.name}
                className="opacity-90 bg-gray-700 backdrop-blur-xl rounded-xl shadow-md shadow-black/50 p-6 text-center border-2 border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:opacity-100"
              >
                <div className="text-4xl mb-3">{metric.icon}</div>
                <h3 className="font-semibold text-cyan-300 mb-2">{metric.name}</h3>
                <p className="text-sm text-gray-200">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 pt-8 border-t border-cyan-500/30">
          <p className="text-gray-400">
            Powered by React + TypeScript + Vite
          </p>
        </div>
      </div>
    </div>
  )
}
