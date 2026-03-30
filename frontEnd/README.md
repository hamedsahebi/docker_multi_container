# Industrial Compressor Monitoring - Frontend

React + TypeScript + Vite application for real-time industrial sensor monitoring with Google OAuth authentication.

## 🚀 Features

- **Real-time Dashboard**: Live sensor data with auto-updating charts
- **Historical Analysis**: Comprehensive historical data visualization
- **Google OAuth Authentication**: Secure user authentication with Google
- **Protected Routes**: Route-level access control
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Testing**: Comprehensive test coverage with Vitest

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Authentication

This application uses Google OAuth 2.0 for authentication. See [AUTHENTICATION.md](./AUTHENTICATION.md) for comprehensive documentation on:

- Authentication flow
- Route protection
- User session management
- API integration
- Security features

### Key Authentication Components

- **AuthContext**: Global authentication state management
- **AuthService**: API communication for auth endpoints
- **ProtectedRoute**: Route protection wrapper
- **LoginPage**: Google OAuth login interface
- **User Menu**: Profile dropdown with logout functionality

## Project Structure

```
frontEnd/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx            # Navigation layout with auth
│   │   ├── MetricCard.tsx        # Sensor metric display
│   │   ├── MetricChart.tsx       # Chart visualization
│   │   └── ProtectedRoute.tsx    # Route protection wrapper
│   ├── contexts/          # React context providers
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/             # Custom React hooks
│   │   └── useSensorData.ts      # Sensor data fetching
│   ├── pages/             # Application pages
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── LoginPage.tsx         # Authentication page
│   │   ├── RealTimeDashboard.tsx # Live monitoring
│   │   └── HistoricalDashboard.tsx # Historical data
│   ├── services/          # API services
│   │   └── authService.ts        # Auth API calls
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── public/                # Static assets
├── Dockerfile             # Development Docker config
├── Dockerfile.prod        # Production Docker with nginx
├── AUTHENTICATION.md      # Authentication documentation
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report

## Environment Configuration

### Development (.env.development)
```env
VITE_API_URL=http://localhost:3000
```

### Production (.env.production)
```env
# Empty = uses relative URLs through nginx proxy
VITE_API_URL=
```

## Docker Deployment

### Multi-stage Production Build

The production Dockerfile uses multi-stage build with nginx:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx configured to proxy /api and /auth to backend
```

### Docker Compose

```bash
# Build and start all services
sudo docker-compose up --build -d

# Frontend available at http://localhost:3065
# Nginx proxies /api and /auth to backend
```

### Nginx Configuration

Production nginx automatically proxies:
- `/` → SPA routing (React app)
- `/api` → `backend:3000/api` (API requests)
- `/auth` → `backend:3000/auth` (Authentication)

## Testing

### Test Framework

- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test src/components/__tests__/MetricCard.test.tsx
```

### Test Coverage

- **76 tests** passing
- Components: MetricCard, MetricChart, Layout
- Pages: LandingPage, RealTimeDashboard
- Hooks: useSensorData
- Services: authService
- Contexts: AuthContext

## Key Technologies

- **React 19.2.0**: UI library
- **TypeScript 5.9.3**: Type safety
- **Vite 4.5.14**: Build tool and dev server
- **React Router 7.1.4**: Client-side routing
- **Recharts 2.14.1**: Data visualization
- **Tailwind CSS 3.4.17**: Utility-first CSS
- **Vitest 0.34.6**: Testing framework

## Authentication Features

✅ Google OAuth 2.0 integration  
✅ Protected routes with automatic redirects  
✅ HttpOnly cookie-based sessions  
✅ User profile dropdown with avatar  
✅ Automatic session refresh  
✅ Loading states during auth checks  
✅ Comprehensive error handling  

## Security

- HttpOnly cookies prevent XSS attacks
- SameSite protection against CSRF
- Secure flag in production (HTTPS)
- Client-side route protection
- API requests with credentials
- CORS with origin validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- React Developer Tools (browser extension)

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check
```

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run `npm test` and `npm run lint`
4. Submit pull request

## Documentation

- [Authentication Guide](./AUTHENTICATION.md) - Complete auth documentation
- [Backend API](../backend/README.md) - Backend documentation
- [Docker Setup](../README.md) - Full project setup

## Support

For issues or questions:
1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) for auth-related issues
2. Review test files for usage examples
3. Check browser console for error messages
4. Verify environment variables are set correctly

---

Built with ❤️ using React + TypeScript + Vite
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
