# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start the development server with Node.js watch mode (auto-restarts on file changes)
- The server runs on port 3000 by default (configurable via `PORT` environment variable)

### Code Quality
- `npm run lint` - Check for linting errors using ESLint
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format all code using Prettier
- `npm run format:check` - Check if code is formatted correctly

### Database Operations
- `npm run db:generate` - Generate Drizzle migration files from schema changes in `src/models/*.js`
- `npm run db:migrate` - Apply pending migrations to the database
- `npm run db:studio` - Open Drizzle Studio for database inspection and management

## Architecture Overview

### Technology Stack
- **Framework**: Express 5.x with ES modules
- **Database**: PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: JWT with bcrypt for password hashing
- **Logging**: Winston (file-based with console output in non-production)

### Project Structure
The codebase follows a layered architecture pattern with path aliases defined in package.json:

```
src/
├── app.js           # Express app configuration and middleware setup
├── server.js        # HTTP server initialization
├── index.js         # Entry point (loads dotenv and starts server)
├── config/          # Configuration files (#config/*)
│   ├── database.js  # Drizzle DB connection and Neon SQL client
│   └── logger.js    # Winston logger configuration
├── models/          # Drizzle schema definitions (#models/*)
│   └── user.model.js
├── routes/          # Express route definitions (#routes/*)
│   └── auth.routes.js
├── controllers/     # Request handlers (#controllers/*)
│   └── auth.controller.js
├── services/        # Business logic layer (#services/*)
│   └── auth.service.js
├── validations/     # Zod validation schemas (#validations/*)
│   └── auth.validation.js
└── utils/           # Utility functions (#utils/*)
    ├── jwt.js       # JWT token sign/verify
    ├── cookies.js   # Cookie helpers
    └── format.js    # Error formatting utilities
```

### Key Architectural Patterns

**Layered Architecture Flow:**
1. **Routes** define endpoints and map to controllers
2. **Controllers** handle HTTP requests, validate input with Zod schemas, and call services
3. **Services** contain business logic and interact with the database via Drizzle ORM
4. **Models** define database schemas using Drizzle's pgTable

**Import Path Aliases:**
All internal imports use the `#` prefix for clean imports (e.g., `#config/logger.js`, `#services/auth.service.js`)

**Middleware Stack (app.js):**
- helmet() - Security headers
- cors() - CORS handling
- express.json() / urlencoded() - Body parsing
- cookieParser() - Cookie parsing
- morgan() - HTTP request logging (piped to Winston)

**Authentication Flow:**
- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens are signed with a secret from `JWT_SECRET` env variable (expires in 1 day)
- Tokens are stored in httpOnly cookies (secure in production, sameSite: strict)

**Database Connection:**
- Uses Neon's serverless PostgreSQL driver (HTTP-based)
- Database URL comes from `DATABASE_URL` environment variable
- Drizzle ORM handles queries and migrations

**Logging:**
- Winston logs to `logs/error.log` and `logs/combined.log`
- Console logging enabled in non-production environments
- HTTP requests logged via Morgan integration

### Code Style Conventions

**ESLint Rules:**
- 2-space indentation with SwitchCase indentation
- Single quotes, semicolons required
- Unix line endings (LF)
- No var (use const/let), prefer const
- Arrow functions preferred over function expressions
- Object shorthand syntax enforced

**Prettier Configuration:**
- 80 character line width
- Single quotes, trailing commas (ES5)
- 2-space tabs, no tabs
- Arrow function parens avoided when possible

### Environment Configuration
Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (defaults to insecure fallback if not set)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (affects logging and cookie security)
- `LOG_LEVEL` - Winston log level (default: 'info')

### Current Implementation Status
The codebase currently implements:
- User registration (`POST /api/auth/sign-up`) with validation, password hashing, and JWT auth
- Health check endpoint (`/health`)
- API status endpoint (`/api`)

Auth routes for sign-in and sign-out are defined but not yet implemented.
