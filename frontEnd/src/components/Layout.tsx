import { Link, useLocation, Outlet } from 'react-router-dom'

export function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/historical', label: '📊 Historical', icon: '📊' },
    { path: '/realtime', label: '⚡ Real-Time', icon: '⚡' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-800">🏭 Compressor Monitor</h1>
            </Link>

            <div className="flex gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.label.replace(/^[^\s]+ /, '')}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
