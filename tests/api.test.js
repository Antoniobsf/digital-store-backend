process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Digital Store API - Testes de Integração', () => {
  let token;
  let userId;
  let categoryId;
  let productId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /v1/user - Deve criar um novo usuário', async () => {
    const res = await request(app).post('/v1/user').send({
      firstname: 'Antônio',
      surname: 'Silva',
      email: 'teste@digitalstore.com',
      password: '123456',
      confirmPassword: '123456',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  test('POST /v1/user/token - Deve autenticar e retornar token JWT', async () => {
    const res = await request(app).post('/v1/user/token').send({
      email: 'teste@digitalstore.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('POST /v1/category - Deve bloquear criação sem token (401)', async () => {
    const res = await request(app).post('/v1/category').send({ name: 'Tênis', slug: 'tenis' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /v1/category - Deve criar categoria autenticado', async () => {
    const res = await request(app)
      .post('/v1/category')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tênis', slug: 'tenis', use_in_menu: true });
    expect(res.statusCode).toBe(201);
    categoryId = res.body.id;
  });

  test('POST /v1/product - Deve criar produto vinculado à categoria', async () => {
    const res = await request(app)
      .post('/v1/product')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tênis Nike Revolution',
        slug: 'tenis-nike-revolution',
        stock: 15,
        description: 'Tênis esportivo confortável',
        price: 299.9,
        price_with_discount: 219.9,
        category_id: categoryId,
      });
    expect(res.statusCode).toBe(201);
    productId = res.body.id;
  });

  test('GET /v1/product/search - Deve listar produtos com categoria associada', async () => {
    const res = await request(app).get('/v1/product/search?match=Nike');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].category.name).toBe('Tênis');
  });

  test('DELETE /v1/product/:id - Deve remover o produto criado', async () => {
    const res = await request(app)
      .delete(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  test('GET /v1/user/:id - Deve retornar dados do usuário sem expor senha', async () => {
    const res = await request(app).get(`/v1/user/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.password).toBeUndefined();
  });
});
