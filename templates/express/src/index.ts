import './env.js';

import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_request, response) => {
  response.json({ message: 'Welcome to your Express TypeScript API!', version: '1.0.0' });
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() },
];

app.get('/api/users', (_request, response) => {
  response.json(users);
});

app.post('/api/users', (request, response) => {
  const { name, email } = (request.body ?? {}) as { name?: unknown; email?: unknown };

  if (typeof name !== 'string' || typeof email !== 'string' || !name.trim() || !email.trim()) {
    response.status(400).json({ error: 'A non-empty "name" and "email" are required.' });
    return;
  }

  const user: User = { id: Date.now(), name, email, createdAt: new Date().toISOString() };
  users.push(user);
  response.status(201).json(user);
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not Found' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  if (response.headersSent) return;
  response.status(500).json({ error: 'Internal Server Error' });
};
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
  console.log('   GET  /, /health, /api/users');
  console.log('   POST /api/users');
});

const shutdown = (signal: string): void => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
