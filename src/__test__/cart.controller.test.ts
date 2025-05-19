import request from 'supertest';
import app from '../app';
import { describe, it, expect } from '@jest/globals';

describe('Cart Controller', () => {
  const testUserId = 1;
  const testProductId = 1;

  let cartProductId: number;

  it('debería crear un carrito para el usuario (POST /cart)', async () => {
    const res = await request(app).post('/cart').send({ userId: testUserId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('cart');
    expect(res.body.cart.userId).toBe(testUserId);
  });

  it('debería agregar un producto al carrito (POST /cart/product)', async () => {
    const res = await request(app).post('/cart/product').send({
      userId: testUserId,
      productId: testProductId,
      quantity: 2
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('cartProduct');
    cartProductId = res.body.cartProduct.id;
  });

  it('debería listar productos del carrito de un usuario (GET /cart/:userId)', async () => {
    const res = await request(app).get(`/cart/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debería eliminar un producto del carrito (DELETE /cart/product/:id)', async () => {
    const res = await request(app).delete(`/cart/product/${cartProductId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
