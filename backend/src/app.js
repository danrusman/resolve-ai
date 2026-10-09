import express from 'express';
import cors from 'cors';

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import occurrenceRoutes from './routes/occurrenceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Middlewares globais (com limite aumentado para suportar upload em Base64)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota de Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Resolve Aí API', timestamp: new Date() });
});

// Registo das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;