import './env.js';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);
await app.register(swagger, {
  openapi: {
    info: { title: 'Fastify TypeScript API', description: 'A TypeScript API built with create-tsx-app', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
  },
});
await app.register(swaggerUi, { routePrefix: '/docs' });

const userSchema = {
  type: 'object',
  properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, createdAt: { type: 'string' } },
} as const;

const createUserSchema = {
  type: 'object',
  required: ['name', 'email'],
  additionalProperties: false,
  properties: { name: { type: 'string', minLength: 1 }, email: { type: 'string', format: 'email' } },
} as const;

app.get('/', async () => ({ message: 'Welcome to your Fastify TypeScript API!', docs: '/docs' }));

app.get('/health', async () => ({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() },
];

app.get('/api/users', { schema: { response: { 200: { type: 'array', items: userSchema } } } }, async () => users);

app.post('/api/users', { schema: { body: createUserSchema, response: { 201: userSchema } } }, async (request, reply) => {
  const { name, email } = request.body as { name: string; email: string };
  const user: User = { id: Date.now(), name, email, createdAt: new Date().toISOString() };
  users.push(user);
  return reply.code(201).send(user);
});

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`API docs available at http://localhost:${port}/docs`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

const shutdown = (signal: string): void => {
  app.log.info(`${signal} received, shutting down...`);
  void app.close().then(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
