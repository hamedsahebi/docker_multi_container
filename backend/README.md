# Sensor Monitoring Backend

Node.js Express backend for the sensor monitoring dashboard application.

## Features

- RESTful API for sensor metrics data
- Support for multiple metric types: temperature, pressure, vibration, power
- CORS enabled for frontend integration
- JSON file-based data storage

## Installation

```bash
npm install
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

The server will start on port 5000 by default.

## API Endpoints

### Get all metrics
```
GET /api/metrics
```
Returns all metric data for temperature, pressure, vibration, and power.

### Get specific metric
```
GET /api/metrics/:metricType
```
Returns data for a specific metric type.

**Parameters:**
- `metricType`: `temperature | pressure | vibration | power`

**Response:**
```json
[
  { "timestamp": "2026-01-16T08:00:00Z", "value": 72.5 },
  { "timestamp": "2026-01-16T08:05:00Z", "value": 73.2 }
]
```

### Health Check
```
GET /health
```
Returns server status.

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
NODE_ENV=development
```

## Project Structure

```
backend/
├── data/               # JSON data files
│   ├── temperature.json
│   ├── pressure.json
│   ├── vibration.json
│   └── power.json
├── routes/             # API routes
│   └── metrics.js
├── server.js           # Main server file
├── package.json
└── .env               # Environment variables
```
