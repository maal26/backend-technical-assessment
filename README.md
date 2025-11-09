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
In this file, make sure the database connection points to the test database running on port `5433`.

Once configured, run:

```bash
npm run test
```

## API Documentation

A Postman collection is included with the project and can be imported to view and test all endpoints.

## Architecture

The project follows a modular, feature-based structure where each domain (e.g., orders, authentication) is self-contained and independent.  
This approach improves scalability, testability, and overall clarity of the codebase.

For more information about the principles behind this design, see:  
- https://phauer.com/2020/package-by-feature/  
- https://github.com/sivaprasadreddy/tomato-architecture

## Design Decisions

## Design Decisions

- **Type Safety:** TypeScript strict mode ensures safer, predictable code.  
- **Validation:** Zod is used for input and schema validation, ensuring all data entering the system is explicitly validated.  
- **Persistence:** Drizzle ORM provides a lightweight, type-safe integration with PostgreSQL.  
- **Logging:** Pino is used for structured, performant logging.  
- **Rate Limiting:** Requests are limited globally using `express-rate-limit` to prevent abuse and excessive traffic.  
- **Authentication:** The system uses an opaque session token instead of JWTs. This approach simplifies invalidation since sessions can be easily revoked or deleted in the database without needing token blacklists or expiry synchronization. It also reduces exposure of user data, as the token itself contains no information. It serves purely as a unique reference to a session record.  
- **Testing Isolation:** Tests run against a dedicated PostgreSQL instance managed via Docker, ensuring no interference with development data.
