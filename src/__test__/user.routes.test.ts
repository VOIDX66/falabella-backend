import request from 'supertest';
import app from '../app';
import { describe, it, expect } from '@jest/globals';

describe('Autenticación de Usuario - Rutas', () => {
  const credentials = {
    email: 'testuser@example.com',
    password: 'Test1234'
  };

  it('debería autenticar y devolver token (POST /users/login)', async () => {
    const res = await request(app).post('/users/login').send(credentials);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('debería denegar acceso con contraseña incorrecta', async () => {
    const res = await request(app).post('/users/login').send({
      email: credentials.email,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('debería cerrar sesión simulada (GET /users/logout)', async () => {
    const res = await request(app).get('/users/logout'); // suponiendo endpoint de logout
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/cerrada/i);
  });
});
