// @ts-nocheck
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(import('@fastify/cors'), {
  origin: true,
});

await fastify.register(import('@fastify/helmet'));

// Register Swagger for API documentation
await fastify.register(import('@fastify/swagger'), {
  swagger: {
    info: {
      title: 'Fastify TypeScript API',
      description: 'A fast and efficient TypeScript API built with Fastify',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Define schemas for type safety
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
} as const;

const createUserSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
} as const;

// Routes
fastify.get('/', async (request, reply) => {
  return {
    message: 'Welcome to your Fastify TypeScript API!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    docs: '/docs',
  };
});

fastify.get(
  '/health',
  {
    schema: {
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },
);

// Mock data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

fastify.get(
  '/api/users',
  {
    schema: {
      description: 'Get all users',
      response: {
        200: {
          type: 'array',
          items: userSchema,
        },
      },
    },
  },
  async (request, reply) => {
    return users;
  },
);

fastify.post(
  '/api/users',
  {
    schema: {
      description: 'Create a new user',
      body: createUserSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            ...userSchema.properties,
            createdAt: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string };

    const newUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    reply.status(201);
    return newUser;
  },
);

// Run the server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📋 Health check available at http://localhost:${port}/health`);
    console.log(`📚 API documentation available at http://localhost:${port}/docs`);
    console.log(`📚 API endpoints:`);
    console.log(`   GET  /api/users - List all users`);
    console.log(`   POST /api/users - Create a new user`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
