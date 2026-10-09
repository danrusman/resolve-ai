import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import occurrenceRoutes from './routes/occurrenceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

const allowedOrigins = [
  'https://resolve-ai-fiap.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso bloqueado pela política de CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Resolve Aí API', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;