# 🚦 Distributed Rate Limiter

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge" alt="Node.js Version">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=for-the-badge" alt="TypeScript">
  <a href="https://github.com/anubhav217/Distributed-Rate-Limiter/issues">
    <img src="https://img.shields.io/github/issues/anubhav217/Distributed-Rate-Limiter.svg?style=for-the-badge" alt="Issues">
  </a>
  <a href="https://github.com/anubhav217/Distributed-Rate-Limiter/network/members">
    <img src="https://img.shields.io/github/forks/anubhav217/Distributed-Rate-Limiter.svg?style=for-the-badge" alt="Forks">
  </a>
  <a href="https://github.com/anubhav217/Distributed-Rate-Limiter/stargazers">
    <img src="https://img.shields.io/github/stars/anubhav217/Distributed-Rate-Limiter.svg?style=for-the-badge" alt="Stars">
  </a>
</p>

An extensible rate-limiting engine for Node.js/Express — supporting fixed-window & token-bucket algorithms, pluggable store backends (in-memory or Redis), and tiered API-key based rate limiting (Free / Pro / Enterprise).

---

## 🧩 What It Does & Why

- Provide rate limiting middleware for Express APIs
- Support both **fixed-window** and **token-bucket** algorithms based on route configuration
- Enable **distributed rate limiting** via a pluggable store (in-memory for quick dev, Redis for production)
- Support **tiered API-key plans**: different plans (Free / Pro / Enterprise) can have different limits
- Easily configurable, extendable, and deployable (via Docker)

---

## 🏗️ Architecture Overview

scss
Copy code
                 ┌─────────────────────────────┐
                 │            Client            │
                 │  (Frontend / Mobile / API)   │
                 └─────────────────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────┐
                 │       Express Server         │
                 │    (src/server/app.ts)       │
                 └─────────────────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────┐
                 │  Rate Limiter Middleware     │
                 │ (src/middleware/...)         │
                 │ - Reads x-api-key             │
                 │ - Determines client plan       │
                 │ - Resolves rule per route      │
                 └─────────────────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────┐
                 │       RateLimiter Core       │
                 │     (src/lib/rateLimiter)    │
                 │ - Fixed window algorithm      │
                 │ - Token bucket algorithm      │
                 └─────────────────────────────┘
                                  │
                                  ▼
     ┌─────────────────────────────────────────────────────┐
     │                     Store Layer                      │
     │                (src/lib/store.ts)                    │
     │                                                     │
     │   ┌──────────────────────┐     ┌──────────────────┐ │
     │   │   MemoryStore        │     │    RedisStore     │ │
     │   │ (single instance)    │     │ (distributed)     │ │
     │   │  Fast local dev       │     │ Multi-instance    │ │
     │   └──────────────────────┘     └──────────────────┘ │
     └─────────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────┐
                 │        Response              │
                 │  X-RateLimit-Limit           │
                 │  X-RateLimit-Remaining       │
                 │  X-RateLimit-Reset           │
                 │  X-RateLimit-Plan            │
                 └─────────────────────────────┘
yaml
Copy code

---

### Component responsibilities

| Component | Purpose |
|-----------|---------|
| Client | Issues requests (Browser / Postman / curl / load test) |
| Express App | API server |
| Middleware | Inspects request, determines policy, enforces limits |
| RateLimiter Core | Implements fixed-window & token-bucket logic |
| RateLimitStore | Abstract persistence interface |
| MemoryStore | In-memory implementation of RateLimitStore |
| RedisStore | Redis-based distributed store implementation |

## 📂 Project Structure

```
Distributed-Rate-Limiter/
├─ src/
│   ├─ lib/               # core rate-limiter + store abstractions
│   │  ├─ types.ts        # TypeScript type definitions
│   │  ├─ store.ts        # RateLimitStore interface
│   │  ├─ memoryStore.ts  # In-memory store implementation
│   │  ├─ redisStore.ts   # Redis store implementation
│   │  └─ rateLimiter.ts  # Core rate limiting algorithms
│   ├─ config/            # API key & route-plan configs
│   │  ├─ apiPlans.ts     # API key plans (Free/Pro/Enterprise) & route rules
│   │  ├─ env.ts          # Environment configuration
│   │  └─ rateLimits.ts   # Rate limit rule resolution logic
│   ├─ middleware/        # Express middleware
│   │  └─ rateLimiterMiddleware.ts
│   └─ server/            # Express app entry-point
│      └─ app.ts
├─ tests/                 # Test files
│  ├─ rateLimiter.unit.test.ts
│  └─ middleware.integration.test.ts
├─ package.json
├─ tsconfig.json
├─ jest.config.ts
├─ Dockerfile.dev
├─ docker-compose.yml
├─ README.md
└─ LICENSE
```

## 🛠 Tech Stack

- Node.js + TypeScript
- Express
- Redis (ioredis)
- Jest + ts-jest
- Docker & Docker Compose

## 🚀 Getting Started

```bash
git clone https://github.com/anubhav217/Distributed-Rate-Limiter.git
cd Distributed-Rate-Limiter
npm install
npm run dev        # starts API server on http://localhost:3000
```

If using Docker (dev mode):

```bash
docker compose up
```

## 🧪 Usage Examples

### ✅ Free plan (default if no key provided)

```bash
# Linux / WSL / macOS (curl)
curl -i http://localhost:3000/api/data

# Windows PowerShell (iwr)
iwr http://localhost:3000/api/data -Verbose
```

### 🔑 Pro plan

```bash
curl -i -H "x-api-key: PRO-DEMO-KEY" http://localhost:3000/api/data
```

### 🚀 Enterprise plan

```bash
curl -i -H "x-api-key: ENTERPRISE-DEMO-KEY" http://localhost:3000/api/data
```

### ✅ Example response headers

```
HTTP/1.1 200 OK
X-RateLimit-Plan: pro
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1765222844542
Content-Type: application/json
...
```

## 🌐 Endpoints & example limits

| Method | Path | Description | Example limits (varies by plan) |
|--------|------|-------------|-------------------|
| GET | `/` | Welcome message | — |
| GET | `/health` | Health check | — |
| GET | `/login` | Example login endpoint | Fixed window — Free: 5, Pro: 10, Enterprise: 20 req/min |
| GET | `/api/data` | Example data endpoint | Token bucket — Free: 60, Pro: 600, Enterprise: 6000 req/min |

### Exceeded limit response

```
HTTP/1.1 429 Too Many Requests
{"error":"too_many_requests","message":"Rate limit exceeded. Please try again later."}
```

## 🔧 Configuration & How It Works

- API keys & plans configured in `src/config/apiPlans.ts`
- Route-based plan rules defined per route-prefix (e.g. `/login`, `/api`)
- Rate limit algorithm and limits resolved dynamically based on plan + route (`resolveRateLimitRule()` in `src/config/rateLimits.ts`)
- Middleware attaches rate limit headers (Limit / Remaining / Reset / Plan) and enforces limits

## 🧩 Core abstractions

### Core Components

- **RateLimitStore** (`src/lib/store.ts`) - Interface for persistence layer
- **MemoryStore** (`src/lib/memoryStore.ts`) - In-memory implementation for development
- **RedisStore** (`src/lib/redisStore.ts`) - Redis-based distributed store with Lua scripts
- **DefaultRateLimiter** (`src/lib/rateLimiter.ts`) - Implements fixed-window and token-bucket algorithms
- **Middleware** (`src/middleware/rateLimiterMiddleware.ts`) - Express middleware that extracts client key, resolves rules, and enforces limits

## 🧪 Tests

- Unit tests: `tests/rateLimiter.unit.test.ts` (fixed-window and token-bucket algorithms)
- Integration tests: `tests/middleware.integration.test.ts` (Express middleware)
- Run: `npm test` | Watch: `npm run test:watch` | Coverage: `npm run test:coverage`

## 🛣 Roadmap

- [x] RedisStore for distributed rate limiting
- [x] Docker Compose setup
- [x] Jest tests (unit + integration)
- [x] Per-API-key / per-plan limits
- [ ] Usage dashboard (React)
- [ ] Publish as npm package
- [ ] CI/CD pipeline
- [ ] Performance benchmarking

## 🤝 Contributing

Pull requests are welcome! Feel free to open issues or suggest improvements.

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 👤 Author

**Anubhav Majumdar**

- GitHub: https://github.com/anubhav217
- LinkedIn: https://www.linkedin.com/in/anubhav-majumdar/

