# Enterprise Login Panel (Next.js + Redis Double Tokenization)

High-assurance authentication portal built with Feature-Sliced Design (FSD), Next.js App Router, Tailwind CSS, and Redis in-memory dual-token architecture.

## Architectural Specification

| Component | Technology | Specification |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router) | React 19, Vanilla JavaScript (ESM) |
| Architecture | Feature-Sliced Design (FSD) | `app/`, `core/`, `features/`, `shared/` |
| Primary Storage | Redis | In-memory session store & token rotation |
| Styling | Tailwind CSS 3.4 | Deep Black & Grey aesthetic (`#0a0a0a`), CVA |
| Cryptography | `jose`, Node `crypto` | HS256 JWT, High-entropy random bytes |
| Validation | Zod | Zero-trust runtime input sanitization |

## Authentication Mechanism: Double Tokenization

```
[Client Login Request]
       │
       ▼
[/api/auth/login] ──► Input Sanitization (Zod)
       │
       ├──► 1. Sign Short-Lived Access Token (JWT - 15m)
       │       └─ Stateless & In-Memory cryptographic verification (< 1ms)
       │
       └──► 2. Generate Opaque Refresh Token (Redis - 7d TTL)
               └─ Atomic Pipeline:
                  SET auth:session:{sessionId} -> JSON Metadata
                  SET auth:refresh:{refreshToken} -> sessionId
                  SADD auth:user_sessions:{userId} -> sessionId
```

### Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Validates credentials, issues JWT + Redis refresh token. |
| `POST` | `/api/auth/refresh` | Atomically rotates refresh token in Redis and issues fresh JWT. |
| `POST` | `/api/auth/logout` | Revokes active session from Redis in-memory storage. |
| `GET` | `/api/auth/me` | Validates access token and verifies Redis active session status. |

## Local Development

### Prerequisites
* Node.js >= 20.0.0
* Redis instance running on `localhost:6379` (or via Docker)

### Installation
```bash
# Clone repository
git clone https://github.com/hauntedcrewvkr/login.git
cd login

# Install dependencies
npm install

# Start development server
npm run dev
```

## Docker Deployment

```bash
# Build and run containers (Next.js + Redis)
docker compose up -d --build
```
The application will be accessible at `http://localhost`.

## Default Demo Credentials
* **Email:** `admin@enterprise.internal`
* **Password:** `Enterprise@2026`
