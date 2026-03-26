import request from 'supertest';
import app from '../src/app';

describe('Server Health', () => {
  describe('GET /health', () => {
    test('should return health status with 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('ok');
      expect(response.body.message).toBe('Server is running');
    });

    test('should respond quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
    });
  });

  describe('Error handling', () => {
    test('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404);
    });

    test('should handle POST requests to health endpoint', async () => {
      await request(app)
        .post('/health')
        .expect(404);
    });
  });

  describe('CORS', () => {
    test('should have CORS headers enabled', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
