# Fastify TypeScript API

Scaffolded with [create-tsx-app](https://github.com/mattiamalonni/create-tsx-app).

## Getting started

```bash
npm install
npm run dev
```

The server listens on `0.0.0.0:3000` (`PORT` and `HOST` override it). Interactive API documentation is available at `http://localhost:3000/docs`.

## Endpoints

| Method | Path         | Description                              |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/`          | Welcome message                          |
| GET    | `/health`    | Liveness and uptime                      |
| GET    | `/api/users` | List example users                       |
| POST   | `/api/users` | Create an example user (`name`, `email`) |

CORS, Helmet, Swagger and Swagger UI are registered. Request/response schemas are declared next to each route, and SIGINT/SIGTERM close Fastify gracefully.

## Scripts

- `npm run dev` — hot reload via `tsx`
- `npm run build` — compile to `dist/`
- `npm start` — run `dist/index.js`
- `npm run type-check`, `npm run lint`, `npm run format` — TypeScript, Oxlint and Oxfmt (when enabled)

Requires Node.js >= 22.18. Replace `npm` with your package manager if you used another one.
