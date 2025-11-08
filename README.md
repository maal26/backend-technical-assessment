# Senior Backend Engineer Technical Assessment

## Overview

This technical assessment is designed to evaluate your backend engineering skills using Node.js and TypeScript.

---

## Objective

Build a RESTful API for an **Order Management System**.

---

## Requirements

### Core Functionality

#### **Order Management Operations**

- POST `/orders` - Create a new order
- GET `/orders` - List all orders (with optional filtering by status)
- GET `/orders/:id` - Get order by ID
- PUT `/orders/:id` - Update order status
- DELETE `/orders/:id` - Cancel order (only if status is 'pending')

#### **Order Model**

- Each order should have: `id`, `customerId`, `items` (array of products with name, quantity, price), `totalAmount`, `status` (pending/processing/completed/cancelled), `createdAt`, `updatedAt`

#### **Business Logic**

- Calculate `totalAmount` automatically from items
- Validate status transitions (e.g., can't go from 'completed' to 'pending')
- Only 'pending' orders can be cancelled

### Technical Requirements

- **TypeScript** with strict mode enabled
- **Express.js** framework
- **Data persistence** (in-memory is acceptable, but bonus for database integration)
- **Input validation** (validate order data, item quantities, prices, etc.)
- **Error handling** (consistent error responses, proper HTTP status codes)
- **Status transition validation**

### Bonus Points

- Unit tests for key functionality
- Request rate limiting
- API documentation (Swagger/OpenAPI)
- Database integration (PostgreSQL, MongoDB, etc.)
- Docker containerization
- Logging middleware
- Request/Response validation with Zod or similar
- Authentication (e.g., JWT-based)

---

## Deliverables

- Source code in a git repository
- README with:
    - Setup instructions
    - API endpoint documentation
    - Environment variables needed
    - How to run tests (if included)
    - Any architectural decisions or trade-offs made
- Example requests/responses (e.g. Postman collection or curl commands)

---

## Submission Guidelines

**Submit before the scheduled interview:**

- Git repository URL (GitHub, GitLab, etc.)
- Ensure README includes:
    - Setup instructions
    - How to run the application
    - API endpoint documentation
    - Any architectural decisions or trade-offs made

---

## Tips for Success

- **Write production-quality code** - treat this as real production code
- **Document your decisions** - explain architectural choices in your README
- **Validate all inputs** - ensure data integrity and proper error handling
- **Think scalability** - consider how the system would handle growth
- **Test your code** - ensure everything works before submitting
- **Don't over-engineer** - focus on the requirements, but show good judgment

---

## Questions?

If you have any questions about the requirements, timeline, or format, please feel free to contact us.

Good luck! 🚀
