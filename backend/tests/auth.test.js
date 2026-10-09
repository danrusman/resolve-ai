import request from 'supertest';
import mongoose from 'mongoose';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_hackathon';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://resolve_admin:resolve_password@localhost:27017/resolve_ai_test_db?authSource=admin';

import app from '../src/app.js';

describe('🧪 Testes da API de Autenticação e Ocorrências', () => {
  let token = '';
  const testEmail = `teste_${Date.now()}@exemplo.com`;
  const testPassword = 'senhaSegura123';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Cadastrar Usuário
  it('Deve registrar um novo solicitante com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário Teste Integrado',
        email: testEmail,
        password: testPassword,
        role: 'SOLICITANTE'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
  });

  // 2. Fazer Login para obter o Token
  it('Deve realizar o login e retornar o token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Guarda o token JWT para o próximo teste
  });

  // 3. Validar Credenciais Inválidas
  it('Deve recusar login com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalido@exemplo.com',
        password: 'errada'
      });

    // Aceita tanto 400 quanto 401 para credenciais inválidas
    expect([400, 401]).toContain(res.statusCode);
  });

  // 4. Criar Ocorrência Autenticado
  it('Deve criar uma ocorrência quando autenticado', async () => {
    const res = await request(app)
      .post('/api/occurrences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Vazamento na Cozinha',
        category: 'Vazamento',
        location: 'Bloco A - Cozinha',
        description: 'Torneira da pia principal a pingar continuamente.'
      });

    expect(res.statusCode).toEqual(201);
  });
});