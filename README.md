## Technologies

- Node.js + TypeScript  
- Express.js  
- Drizzle ORM with PostgreSQL  
- Zod for schema validation  
- Pino for logging  
- Supertest for integration testing  
- Docker for PostgreSQL setup  

## Setup Instructions

1. Clone the repository  
   ```bash
   git clone git@github.com:maal26/backend-technical-assessment.git
   cd backend-technical-assessment
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Copy the environment example file  
   ```bash
   cp .env.example .env
   ```

4. Start the PostgreSQL container  
   ```bash
   docker compose up -d --build
   ```

5. Run database migrations  
   ```bash
   npx drizzle-kit push
   ```

6. Start the development server  
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

## Testing

Tests use Node’s built-in test runner and Supertest.   A dedicated PostgreSQL instance is used to ensure isolation during test runs.

Before running the tests, create a `.env.testing` file based on `.env.example` and configure it to point to the test database.

Once configured, run:

```bash
npm run test
```

## API Documentation

A Postman collection is included with the project and can be imported to view and test all endpoints.

## Architecture

The project follows a modular, feature-based structure.   Each module encapsulates its own logic, while shared configurations and services are organized under a common layer.   Validation is handled through Zod, database operations through Drizzle ORM, and logging through Pino.

## Design Decisions

- **Type Safety:** TypeScript strict mode ensures safer, predictable code.  
- **Validation:** Zod is used for input and schema validation.  
- **Persistence:** Drizzle ORM provides a lightweight, type-safe integration with PostgreSQL.  
- **Logging:** Pino is used for structured, performant logging.  
- **Isolation:** Tests run against a dedicated PostgreSQL instance managed via Docker.  