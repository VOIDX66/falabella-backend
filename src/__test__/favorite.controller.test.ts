import request from 'supertest';
import app from '../app';
import { describe, it, expect } from '@jest/globals';

describe('Favorite Controller', () => {
  const testUserId = 1;
  const testProductId = 1;
  let favoriteId: number;

  it('debería agregar un producto a favoritos (POST /favorites)', async () => {
    const res = await request(app).post('/favorites').send({
      userId: testUserId,
      productId: testProductId
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('favorite');
    favoriteId = res.body.favorite.id;
  });

  it('debería listar los productos favoritos del usuario (GET /favorites/:userId)', async () => {
    const res = await request(app).get(`/favorites/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debería eliminar un producto de favoritos (DELETE /favorites/:id)', async () => {
    const res = await request(app).delete(`/favorites/${favoriteId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
