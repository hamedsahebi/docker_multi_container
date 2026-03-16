const request = require('supertest');
const app = require('../app');
const fs = require('fs').promises;
const path = require('path');

describe('Metrics API', () => {
  describe('GET /api/metrics/:metricType', () => {
    const validMetrics = ['temperature', 'pressure', 'vibration', 'power'];

    validMetrics.forEach(metric => {
      test(`should return ${metric} data successfully`, async () => {
        const response = await request(app)
          .get(`/api/metrics/${metric}`)
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        
        // Check data structure
        const dataPoint = response.body[0];
        expect(dataPoint).toHaveProperty('timestamp');
        expect(dataPoint).toHaveProperty('value');
        expect(typeof dataPoint.timestamp).toBe('string');
        expect(typeof dataPoint.value).toBe('number');
      });
    });

    test('should return 400 for invalid metric type', async () => {
      const response = await request(app)
        .get('/api/metrics/invalid')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid metric type');
      expect(response.body).toHaveProperty('validTypes');
      expect(response.body.validTypes).toEqual(validMetrics);
    });

    test('should return 404 if data file does not exist', async () => {
      // Mock console.error to suppress expected error logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fs.readFile to throw ENOENT error
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue({ code: 'ENOENT' });

      const response = await request(app)
        .get('/api/metrics/temperature')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Metric data not found');

      // Restore original functions
      fs.readFile = originalReadFile;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /api/metrics', () => {
    test('should return all metrics data', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('pressure');
      expect(response.body).toHaveProperty('vibration');
      expect(response.body).toHaveProperty('power');

      // Check each metric has data
      Object.values(response.body).forEach(metricData => {
        expect(metricData).toBeInstanceOf(Array);
        expect(metricData.length).toBeGreaterThan(0);
      });
    });

    test('should handle errors when reading all metrics', async () => {
      // Mock console.error to suppress expected error logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fs.readFile to throw an error
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue(new Error('Read error'));

      const response = await request(app)
        .get('/api/metrics')
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to load metrics data');

      // Restore original functions
      fs.readFile = originalReadFile;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data validation', () => {
    test('temperature data should be within expected range', async () => {
      const response = await request(app)
        .get('/api/metrics/temperature')
        .expect(200);

      response.body.forEach(dataPoint => {
        expect(dataPoint.value).toBeGreaterThanOrEqual(0);
        expect(dataPoint.value).toBeLessThanOrEqual(200);
      });
    });

    test('pressure data should be within expected range', async () => {
      const response = await request(app)
        .get('/api/metrics/pressure')
        .expect(200);

      response.body.forEach(dataPoint => {
        expect(dataPoint.value).toBeGreaterThanOrEqual(0);
        expect(dataPoint.value).toBeLessThanOrEqual(300);
      });
    });

    test('timestamps should be valid ISO 8601 format', async () => {
      const response = await request(app)
        .get('/api/metrics/temperature')
        .expect(200);

      response.body.forEach(dataPoint => {
        const date = new Date(dataPoint.timestamp);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });
  });
});
