# Design and Technology Decisions

## 1. Tech Stack Selection

### Chosen Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Python + FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy

### Rationale

The application is architected using React, FastAPI, and PostgreSQL to ensure a clean decoupling of the client interface, API layer, and relational data.

While my primary full stack experience is heavily rooted in the Node.js ecosystem (e.g., Next.js, Express), I intentionally selected **Python and FastAPI** for the backend because of its distinct technical advantages for modern API development:

- **High Performance & Speed:** FastAPI is built on ASGI (Starlette) and Pydantic, making it one of the fastest Python frameworks available, rivaling Node.js and Go in API performance.
- **Strict Type Safety & Auto Validation:** FastAPI enforces Python type hinting and automatic request validation out-of-the-box, significantly reducing runtime errors and boilerplate code compared to standard Express.js applications.
- **Scalable Architecture:** This decoupled stack (React SPA + Python REST API) perfectly mirrors modern, multi tenant SaaS architectures, allowing the frontend and backend to be scaled, tested, and deployed entirely independently.

This stack not only ensures a highly performant and robust MVP, but also demonstrates my adaptability and proficiency in rapidly delivering production grade APIs in a Python environment.

### Frontend: React + Vite + Tailwind CSS

React was chosen because the assignment requires forms, dashboards, and interactive state changes, which fit naturally with a React SPA.

Vite provides a lightweight development setup suitable for a small application. Tailwind CSS is used for straightforward and consistent UI styling without introducing unnecessary UI dependencies.

### Backend: Python + FastAPI

FastAPI was chosen to implement the REST API in Python, directly aligning with the role's requirements.

It also provides:

- Type hints
- Request/response validation through Pydantic
- Automatic API documentation
- A clean structure for REST endpoints

### Database: PostgreSQL

PostgreSQL was chosen because the application's data is relational:

- An employee can submit multiple expenses.
- Each expense belongs to an employee.
- Expense status and approval information need to be persisted.
- Relationships can be enforced using foreign keys.

SQLAlchemy is used as the ORM, with database migrations handled through Alembic.

---

## 2. Data Model

The application uses two primary tables:

### Users

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| name | String | User's name |
| role | Enum | `employee` or `manager` |

### Expenses

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| employee_id | Integer | Foreign key → `users.id` |
| amount | Decimal | Expense amount |
| description | String | Expense description |
| expense_date | Date | Date of expense |
| status | Enum | `pending`, `approved`, or `rejected` |

One user can have many expenses, while each expense belongs to one employee.

Managers can change the status of submitted expenses.

The total approved expense amount is calculated from expenses where `status = approved`.

---

## 3. Authentication & Authorization

The assignment requires different capabilities for employees and managers but does not explicitly require a production authentication system.

For this assignment, authentication is intentionally kept lightweight so that implementation effort remains focused on the core expense workflow.

The application provides separate employee and manager views/actions. Backend endpoints also validate the user's role before allowing manager-only operations such as approving or rejecting expenses.

A production implementation would replace this simplified identity mechanism with JWT/session-based authentication and persistent user authentication.

---

## 4. API & Data Flow

The frontend communicates with the backend exclusively through REST APIs.

The API is responsible for:

- Creating expenses
- Fetching expenses
- Approving/rejecting expenses
- Calculating approved expense totals

The frontend handles loading, success, and error states for API requests.

---

## 5. Scope Decisions

The assignment is intentionally implemented as a focused MVP.

The following are outside the current scope:

- Password reset
- Email notifications
- OAuth/social login
- Expense receipt uploads
- Multi-level approval workflows
- Advanced reporting

These features could be added in a production version but are not necessary to satisfy the assignment requirements.
