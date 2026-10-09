import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/resolve_ai_db';

// Conexão com a base de dados MongoDB e arranque do servidor
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend rodando na porta ${PORT}`);
    });
  })
  .catch((err) => console.error('❌ Erro ao conectar no MongoDB:', err.message));