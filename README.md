# Nexus API

E-commerce REST API built as a senior-level NestJS portfolio project, deployed serverlessly on Vercel.

## Preview

![Swagger UI](./screenshots/Screenshot%202026-04-15%20164338.png)

## Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Framework | NestJS 11 + TypeScript | Core framework |
| Persistence | TypeORM + SQLite in-memory (`better-sqlite3`) | Repository pattern, zero-config DB |
| Advanced logic | `@nestjs/cqrs` | CQRS pattern — exclusive to Orders module |
| Auth | `@nestjs/jwt` + `passport-jwt` + `bcrypt` | JWT authentication & password hashing |
| Authorization | Custom `RolesGuard` + `@Roles()` decorator | Role-based access control (Admin / Client) |
| Docs | `@nestjs/swagger` | Interactive Swagger UI at `/docs` |
| Rate limiting | `@nestjs/throttler` | 20 requests / minute globally |
| Validation | `class-validator` + `class-transformer` | DTO validation pipeline |
| Deployment | Vercel (serverless) | Express adapter exported as a handler |

## Project Structure

```
src/
├── main.ts                        # Serverless handler + local dev server
├── app.module.ts                  # Root module
├── common/
│   ├── decorators/                # @Roles(), @CurrentUser()
│   ├── filters/                   # GlobalExceptionFilter
│   └── guards/                    # JwtAuthGuard, RolesGuard
├── auth/                          # JWT strategy, login, register
├── users/                         # User entity, Role enum
├── products/                      # Product CRUD (Admin writes, public reads)
├── orders/                        # CQRS: CommandBus + QueryBus
│   ├── commands/handlers/         # CreateOrderHandler
│   └── queries/handlers/          # GetOrdersHandler, GetOrderByIdHandler
└── database/                      # SeederService — auto-seeds on every boot
```

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

> Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production build
npm run build

# Production server
npm run start:prod
```

## Seeded Credentials

The database is automatically populated on every boot with 2 users and 10 products.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@nexus.dev` | `Admin123!` |
| Client | `client@nexus.dev` | `Client123!` |

## API Endpoints

All endpoints are prefixed with `/api`. Interactive docs available at `/docs`.

```
POST   /api/auth/register      Register a new client account
POST   /api/auth/login         Login — returns JWT access_token

GET    /api/products           List active products (public)
GET    /api/products/:id       Get product by ID (public)
POST   /api/products           Create product (Admin)
PATCH  /api/products/:id       Update product (Admin)
DELETE /api/products/:id       Delete product (Admin)

POST   /api/orders             Place an order — CreateOrderCommand (CQRS)
GET    /api/orders             Get orders — GetOrdersQuery (CQRS)
GET    /api/orders/:id         Get order by ID — GetOrderByIdQuery (CQRS)
```

## Deployment on Vercel

```bash
vercel deploy
```

The `vercel.json` routes all traffic to `dist/main.js`, which exports the NestJS app as a serverless handler via the Express adapter.
