import request from 'supertest';
import app from '../app';
import { describe, it, expect } from '@jest/globals';

describe('User Controller', () => {

  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test1234'
  };

  it('debería registrar un nuevo usuario (POST /users/register)', async () => {
    const res = await request(app).post('/users/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('debería iniciar sesión correctamente (POST /users/login)', async () => {
    const res = await request(app).post('/users/login').send({
      email: testUser.email,
      password: testUser.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('debería fallar el login con contraseña incorrecta', async () => {
    const res = await request(app).post('/users/login').send({
      email: testUser.email,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
