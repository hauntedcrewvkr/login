# Enterprise Login Panel (Next.js + Redis Double Tokenization)

High-assurance authentication portal built with Feature-Sliced Design (FSD), Next.js App Router, Tailwind CSS, and Redis / AWS ElastiCache dual-token architecture.

## Architectural Specification

| Component | Technology | Specification |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router) | React 19, Vanilla JavaScript (ESM) |
| Architecture | Feature-Sliced Design (FSD) | `app/`, `core/`, `features/`, `shared/` |
| Primary Storage | Redis / AWS ElastiCache | In-memory session store & token rotation |
| Process Manager | PM2 | Daemon process management & zero-downtime reload |
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
       └──► 2. Generate Opaque Refresh Token (Redis / ElastiCache - 7d TTL)
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

## Production Deployment (Native Node.js + PM2 on AWS EC2)

### 1. Prerequisites
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager
sudo npm install -g pm2
```

### 2. Setup & Configuration
```bash
git clone https://github.com/hauntedcrewvkr/login.git
cd login
npm install

# Create environment configuration
cp .env.example .env.local
# Edit REDIS_URL to point to your AWS ElastiCache Primary Endpoint
```

### 3. Build & Run 24/7 with PM2
```bash
# Build production bundle
npm run build

# Start daemon process on Port 80
sudo env PATH=$PATH:$(which node) PORT=80 pm2 start npm --name "login-panel" -- start

# Configure automatic startup on server reboot
sudo pm2 startup
sudo pm2 save
```

## Default Demo Credentials
* **Email:** `admin@enterprise.internal`
* **Password:** `Enterprise@2026`
