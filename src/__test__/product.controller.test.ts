import request from 'supertest';
import app from '../app';
import { describe, it, expect } from '@jest/globals';

describe('Product Controller', () => {

  let createdProductId: number;

  const testProduct = {
    name: 'Test Product',
    price: 99900,
    description: 'Producto de prueba Jest',
    stock: 10
  };

  it('debería crear un nuevo producto (POST /products)', async () => {
    const res = await request(app).post('/products').send(testProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('product');
    createdProductId = res.body.product.id;
  });

  it('debería obtener todos los productos (GET /products)', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debería obtener un producto por ID (GET /products/:id)', async () => {
    const res = await request(app).get(`/products/${createdProductId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdProductId);
  });

  it('debería devolver 404 si el producto no existe', async () => {
    const res = await request(app).get('/products/999999');
    expect(res.statusCode).toBe(404);
  });
});
