# Church Admin & Ledger - Application Roadmap

This document outlines the architectural blueprint, strict design constraints, and development milestones for scaling the **Church Admin & Ledger** application to support **1 billion users** horizontally.

---

## 🏛️ Strict Architectural Constraints

To guarantee horizontal scaling and fault tolerance across distributed node clusters, all backend services must strictly adhere to the following principles:

### 1. Stateless Backend Code
*   **Zero Local State**: The API layer must be completely stateless. No files, session data, or application states may be stored on the server's local disk or in-memory cache.
*   **Node Interchangeability**: Any server instance must be able to handle any request at any given time without relying on state from previous requests.

### 2. Session Management
*   **JWT Authentication**: Secure stateless authentication using JSON Web Tokens (JWT) signed by a shared secret or public/private key pairs.
*   **Centralized Redis Cache**: For token blacklisting, rate limiting, and real-time session tracking, ensuring all instances query a centralized cache instead of local memory.

### 3. Database Architecture
*   **PostgreSQL Engine**: Use PostgreSQL as the primary database engine for relational integrity, core authentication, and financial ledgers.
*   **Scaling Ready**: Write schema migrations and queries structured to support database sharding and table partitioning (e.g., partitioning ledger entries by `church_id` or `timestamp`).

### 4. File Storage
*   **Direct Cloud Streaming**: All uploads (e.g., member profile pictures, receipt PDFs for financial ledger entries) must bypass local server disks.
*   **S3 / Cloudflare R2 Integration**: Uploads must stream directly from the client to AWS S3 / Cloudflare R2 via pre-signed URLs, or be streamed through stateless API buffer passes directly to object storage.

---

## 🗺️ Development Milestones

### Phase 1: Backend Scaffolding & Setup 🚀
*   [ ] Initialize the backend project directory (`/server` or `/backend`).
*   [ ] Configure TypeScript/JavaScript and Node.js environment.
*   [ ] Scaffold core Express/Fastify application with structured folders (controllers, routes, middleware, services).
*   [ ] Integrate database connection pools (`pg` or Prisma/Sequelize) with query logging.
*   [ ] Set up health checks and configuration loaders using environment variables.

### Phase 2: Database Schema & Partitioning Design 💾
*   [ ] Design core authentication database schema (`users`, `roles`, `permissions`).
*   [ ] Design financial ledger schema (`ledgers`, `transactions`, `accounts`) with double-entry constraints.
*   [ ] Implement initial table partitioning strategies in PostgreSQL (e.g., range partitioning for transactions, list partitioning for church chapters).
*   [ ] Write migration scripts for database version control.

### Phase 3: Stateless Authentication & Sessions 🔑
*   [ ] Implement JWT generation, signature verification, and validation middleware.
*   [ ] Set up Redis client for token revocation, blacklisting, and rate limiting.
*   [ ] Standardize error responses for unauthorized or expired credentials.
*   [ ] Build password hashing using bcrypt or Argon2.

### Phase 4: Financial Ledger API 📈
*   [ ] Build transactional endpoints for recording offerings, tithes, and expenditures.
*   [ ] Enforce ACID compliance on database transactions to avoid race conditions.
*   [ ] Create structured reports (balance sheets, income statements) with paginated/partition-friendly queries.

### Phase 5: Direct-to-Cloud Storage Service ☁️
*   [ ] Implement S3/R2 client SDK service layer.
*   [ ] Create stateless endpoints for generating pre-signed upload URLs.
*   [ ] Build file size and MIME-type validation middleware prior to signature generation.
*   [ ] Store uploaded file metadata (URLs, keys) directly in PostgreSQL.

---

## 📂 Proposed Backend Folder Structure

```text
backend/
├── src/
│   ├── config/             # Environment variables and system configurations
│   ├── controllers/        # Express handlers (auth, ledger, storage)
│   ├── database/           # DB connections, migrations, seeds
│   │   ├── migrations/     # Version-controlled schema migrations
│   │   └── index.ts        # DB connection pool setup
│   ├── middleware/         # Auth verification, rate limiting, validations
│   ├── models/             # Schema definitions and TS interfaces
│   ├── routes/             # API route controllers
│   ├── services/           # Business logic (e.g., S3 stream service)
│   └── index.ts            # Entrypoint file
├── .env.example            # Environment template file
├── package.json
└── tsconfig.json
```
