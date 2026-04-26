# Women's Fashion & Beauty E-Commerce Platform

Sprint 0 foundation for a full-stack e-commerce application with:

- `client`: Next.js + TypeScript
- `server`: Node.js (Express) + TypeScript
- `database`: PostgreSQL (Docker Compose ready)

## Project Structure

```txt
.
├── client/          # Next.js app (customer + admin UI later)
├── server/          # Express REST API
├── docker-compose.yml
└── package.json     # Monorepo helper scripts
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (recommended for PostgreSQL)

## Environment Setup

1. Backend env:
   - Copy `server/.env.example` to `server/.env`
2. Frontend env:
   - Copy `client/.env.local.example` to `client/.env.local`

## Run PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL at `localhost:5432` with:

- database: `women_fashion_beauty`
- user: `postgres`
- password: `postgres`

## Run Apps

From repo root:

```bash
npm run dev
```

This runs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Connectivity Check

- Backend endpoint: `GET /api/health`
- Frontend home page calls backend health endpoint and displays DB connection status.

## Backend Architecture

The server follows a clean modular structure:

```txt
server/src
├── app.ts
├── server.ts
├── config/
├── middleware/
├── routes/
└── modules/
    └── health/
        ├── health.controller.ts
        ├── health.service.ts
        ├── health.repository.ts
        ├── health.model.ts
        ├── health.validation.ts
        ├── health.routes.ts
        └── index.ts
```

## Suggested Git Branching

- `main`: stable production-ready code
- `develop`: integration branch for ongoing work
- `feature/<name>`: feature branches for sprint tasks

Example:

```bash
git checkout -b develop
git checkout -b feature/sprint-1-auth
```
