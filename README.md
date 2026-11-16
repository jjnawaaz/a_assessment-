# Pastebin - Text Sharing API

A lightweight Pastebin-like application built with **Node.js, TypeScript, Express, Prisma, and PostgreSQL**.

Users can create text pastes and share them through unique URLs. Each paste can optionally have an expiration time or a maximum view count.

The application provides both a JSON REST API and a simple HTML page for viewing shared pastes.

## Features

- Create and share text pastes using unique URLs.
- Retrieve paste content through a REST API.
- View shared pastes through a browser-friendly HTML page.
- Set an optional expiration date and time.
- Set an optional maximum number of views.
- Automatically prevent access to expired or exhausted pastes.
- Atomically increment view counts to handle concurrent requests safely.
- Validate incoming data against application-level business rules.
- Return consistent JSON error responses.
- Escape HTML content to protect against stored Cross-Site Scripting (XSS).

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Static typing |
| Express | HTTP server and routing |
| PostgreSQL | Relational database |
| Neon | Managed PostgreSQL hosting |
| Prisma 7 | Database ORM |
| Prisma PostgreSQL Adapter | PostgreSQL driver integration |
| Nanoid | Unique paste ID generation |
| Vitest | Testing framework |
| Supertest | HTTP integration testing |

## Architecture

The application follows a layered architecture that separates HTTP handling, business logic, database access, and shared infrastructure.

### Project Structure

```text
src/
├── config/
│   └── env.ts
│
├── controllers/
│   ├── paste.controller.ts
│   └── paste-page.controller.ts
│
├── lib/
│   └── prisma.ts
│
├── middlewares/
│   └── error.middleware.ts
│
├── routes/
│   └── paste.routes.ts
│
├── services/
│   └── paste.service.ts
│
├── types/
│   └── paste.types.ts
│
├── utils/
│   └── generate-id.ts
│
├── app.ts
└── server.ts

prisma/
├── migrations/
└── schema.prisma

tests/
└── paste.test.ts
```

### Request Lifecycle

```text
HTTP Request
     |
     v
Express Application
     |
     v
Router
     |
     v
Controller
     |
     v
Service Layer
     |
     v
Prisma Client
     |
     v
PostgreSQL
```

### Layer Responsibilities

- **Routes:** Define API endpoints and connect them to controllers.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Implement business rules, validation, and database operations.
- **Prisma:** Provide typed database access through the PostgreSQL adapter.
- **Middleware:** Handle application errors consistently.
- **Types:** Define application-level TypeScript contracts.
- **Utilities:** Provide reusable functionality such as ID generation.
- **Configuration:** Centralize environment variables and application settings.

## Database Design

The application uses a single `Paste` model.

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique paste identifier |
| `content` | Text | Stored paste content |
| `createdAt` | DateTime | Paste creation timestamp |
| `expiresAt` | DateTime? | Optional expiration timestamp |
| `maxViews` | Int? | Optional maximum number of views |
| `viewCount` | Int | Number of successful views |

### Expiration and View Limits

A paste is accessible only when both conditions are satisfied:

1. It has not passed its expiration time.
2. Its view count has not reached its configured maximum view limit.

A paste without an expiration date or maximum view count remains available indefinitely, subject to database availability.

The application checks these conditions whenever a paste is retrieved.

### Concurrency Safety

View-count increments are performed atomically at the database level.

The availability conditions and view-count increment are executed as a single database operation. This prevents concurrent requests from exceeding the configured view limit through a read-then-update race condition.

For example, if a paste has a maximum of one view and ten requests arrive concurrently, only one request can successfully retrieve the paste.

## API Documentation

Base URL:

`http://localhost:3000`

### 1. Health Check

**GET `/api/health`**

Checks whether the application is running.

Example response:

```json
{
  "status": "ok",
  "message": "Aganitha Assessment API is running"
}
```

### 2. Create a Paste

**POST `/api/pastes`**

Creates a new paste.

Request body:

```json
{
  "content": "Hello, this is my first paste!",
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "maxViews": 10
}
```

Only `content` is required. `expiresAt` and `maxViews` are optional.

Example response — `201 Created`:

```json
{
  "id": "abc123xyz789",
  "url": "http://localhost:3000/p/abc123xyz789",
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "maxViews": 10
}
```

**Business-rule validation:**

- Content must be a non-empty string.
- Expiration date must be valid and in the future.
- Maximum views must be a positive integer.

### 3. Retrieve a Paste

**GET `/api/pastes/:id`**

Retrieves paste information and increments its view count.

Example response — `200 OK`:

```json
{
  "id": "abc123xyz789",
  "content": "Hello, this is my first paste!",
  "createdAt": "2026-11-16T10:00:00.000Z",
  "expiresAt": null,
  "maxViews": 10,
  "viewCount": 1
}
```

A paste that does not exist, has expired, or has exhausted its view limit returns `404 Not Found`.

Each successful retrieval consumes one view.

### 4. View a Paste in the Browser

**GET `/p/:id`**

Returns an HTML page containing the paste content.

The content is HTML-escaped before rendering to prevent stored XSS.

Each successful browser-page request also consumes one view.

## Error Handling

The application uses centralized Express error-handling middleware.

Expected application errors are represented using a custom `AppError` class, which carries an HTTP status code.

Unexpected errors are logged internally and returned as generic error responses to avoid exposing implementation details.

Example error response:

```json
{
  "error": "Paste not found or unavailable"
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Paste created |
| `400` | Invalid request data |
| `404` | Paste not found or unavailable |
| `500` | Unexpected server error |

## Runtime Validation

The application currently implements basic business-rule validation within the service layer.

This includes:

- Checking that paste content is a non-empty string.
- Validating expiration dates.
- Ensuring expiration dates are in the future.
- Ensuring maximum view counts are positive integers.

A dedicated schema-based runtime validation layer at the API boundary has not been implemented, as it was outside the scope of this assessment.

TypeScript interfaces provide compile-time type checking, but they do not validate incoming HTTP request payloads at runtime.

This can be extended using **Zod** to introduce schema-based request validation, centralized validation middleware, and structured validation errors.

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL database or a Neon PostgreSQL database

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your-postgresql-connection-string"
PORT=3000
NODE_ENV=development
APP_URL="http://localhost:3000"
```

Replace the database URL with your PostgreSQL connection string.

Never commit your actual `.env` file.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply Database Migrations

```bash
npx prisma migrate dev
```

### 6. Start the Development Server

```bash
npm run dev
```

The API will be available at:

`http://localhost:3000`

Health check:

`http://localhost:3000/api/health`

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with automatic reload using `tsx` |
| `npm run build` | Generate Prisma Client and compile TypeScript |
| `npm start` | Start the compiled production server |
| `npm test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply development database migrations |
| `npm run prisma:deploy` | Apply pending production database migrations |

## Testing

The application uses Vitest and Supertest for integration testing against the configured PostgreSQL database.

Run the test suite:

```bash
npm test
```

The tests cover:

- Successful paste creation.
- Paste retrieval.
- Health endpoint.
- Input validation.
- Invalid and past expiration dates.
- Invalid maximum view counts.
- Time-based expiration enforcement.
- View-limit enforcement.
- Concurrent requests and atomic view counting.
- Special characters and multiline content.
- HTML rendering.
- HTML escaping and XSS prevention.

Test-created records are tracked and cleaned up after the test suite completes.

## Deployment

The application is deployed using:

- **Vercel:** Express application hosting.
- **Neon:** Managed PostgreSQL database.

### Vercel Configuration

Vercel supports Express applications directly.

The application exports its configured Express instance as the default export from `src/app.ts`, which serves as the Vercel application entry point.

Vercel automatically detects and deploys the Express application as a serverless function.

The existing `src/server.ts` remains the entry point for running the application locally.

### Environment Variables

Configure the following environment variables in Vercel under:

**Project Settings → Environment Variables**

```env
DATABASE_URL="your-neon-postgresql-connection-string"
NODE_ENV=production
APP_URL="https://your-project.vercel.app"
```

`APP_URL` must contain the actual deployed Vercel URL so that generated paste links point to the production application.

### Prisma Client Generation

Prisma Client must be generated during deployment to ensure it matches the current database schema.

Add the following script to `package.json`:

```json
{
  "postinstall": "prisma generate"
}
```

This ensures Prisma Client is generated during dependency installation.

### Production Database Migrations

Apply pending database migrations using:

```bash
npx prisma migrate deploy
```

Ensure the production `DATABASE_URL` is available to the Prisma CLI when running this command.

Apply migrations before deploying application changes that depend on the updated database schema.

### Deploying to Vercel

1. Push the project to a private Git repository.
2. Import the repository into Vercel.
3. Configure the production environment variables.
4. Ensure Prisma Client generation is configured through `postinstall`.
5. Apply pending production database migrations.
6. Deploy the application.

Vercel automatically detects the Express entry point and handles the application deployment.

## Design Considerations

- **Separation of concerns:** HTTP handling and business logic are kept separate.
- **Type safety:** TypeScript provides explicit application contracts.
- **Database consistency:** View limits are enforced through atomic database operations.
- **Security:** HTML escaping prevents stored XSS when rendering paste content.
- **Configuration:** Environment-specific settings are centralized.
- **Testability:** Integration tests exercise the application through actual HTTP requests.
- **Extensibility:** The architecture allows additional validation, middleware, and features to be introduced without restructuring the application.

---

Built as part of the Aganitha backend engineering assessment.