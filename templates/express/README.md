# Express TypeScript API

Scaffolded with [create-tsx-app](https://github.com/mattiamalonni/create-tsx-app).

## Getting started

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000` (`PORT` overrides it).

## Endpoints

| Method | Path         | Description                              |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/`          | Welcome message                          |
| GET    | `/health`    | Liveness and uptime                      |
| GET    | `/api/users` | List example users                       |
| POST   | `/api/users` | Create an example user (`name`, `email`) |

Security headers (Helmet), CORS and request logging (Morgan) are enabled. Unknown routes return JSON 404s, and errors are handled centrally. SIGINT/SIGTERM close the HTTP server gracefully.

## Scripts

- `npm run dev` — hot reload via `tsx`
- `npm run build` — compile to `dist/`
- `npm start` — run `dist/index.js`
- `npm run type-check`, `npm run lint`, `npm run format` — TypeScript, Oxlint and Oxfmt (when enabled)

Requires Node.js >= 22.18. Replace `npm` with your package manager if you used another one.
