const request = require('supertest');
const app = require('../server');

describe('API Health Check', () => {
  test('Server should be running', async () => {
    const res = await request(app)
      .get('/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Server is running');
  });
});

describe('Authentication', () => {
  test('Should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });

  test('Should validate email format on registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'invalidemail',
        password: 'ValidPassword123'
      });
    
    expect(res.statusCode).toBe(400);
  });

  test('Should reject password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'short'
      });
    
    expect(res.statusCode).toBe(400);
  });
});
