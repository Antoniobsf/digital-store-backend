module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Digital Store API',
    version: '1.0.0',
    description: 'API RESTful do Projeto Final de Back-end (CRUD de Usuários, Categorias e Produtos com JWT).',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/v1/user': {
      post: { tags: ['Users'], summary: 'Criar novo usuário', responses: { 201: { description: 'Criado' } } },
    },
    '/v1/user/token': {
      post: { tags: ['Users'], summary: 'Gerar token JWT (Login)', responses: { 200: { description: 'Token retornado' } } },
    },
    '/v1/user/{id}': {
      get: { tags: ['Users'], summary: 'Buscar usuário por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      put: { tags: ['Users'], summary: 'Atualizar usuário (JWT)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Atualizado' } } },
      delete: { tags: ['Users'], summary: 'Remover usuário (JWT)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Removido' } } },
    },
    '/v1/category/search': {
      get: { tags: ['Categories'], summary: 'Listar categorias', responses: { 200: { description: 'OK' } } },
    },
    '/v1/category': {
      post: { tags: ['Categories'], summary: 'Criar categoria (JWT)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Criada' } } },
    },
    '/v1/product/search': {
      get: { tags: ['Products'], summary: 'Listar produtos', responses: { 200: { description: 'OK' } } },
    },
    '/v1/product': {
      post: { tags: ['Products'], summary: 'Criar produto (JWT)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Criado' } } },
    },
  },
};
