# SportBook — Sports Court/Venue Booking System

A full-stack sports venue booking application built with **Spring Boot 3**, **Angular 18**, **PostgreSQL**, and **Docker**.

## 🏟️ Features

### User Features
- 🔐 Register & Login with JWT authentication
- 🔍 Browse & search/filter/sort venues by sport, name, location
- 📅 Book a slot using a date picker + time-slot dropdown
- ❌ Cancel your bookings
- 👤 View all your bookings with status tabs (Active / Cancelled)

### Admin Features
- ⚡ View KPI dashboard (total venues, bookings, revenue)
- ➕ Add new sports venues
- ✏️ Edit existing venue details
- 🗑️ Delete venues
- 📋 View and cancel all user bookings

### Technical
- JWT-based stateless authentication
- Role-based access control (ADMIN / USER)
- BCrypt password hashing
- PostgreSQL database with automatic schema creation
- Docker multi-service deployment
- CORS configured for Angular integration

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8080

### Option 2: Local Development

**Backend (requires PostgreSQL running locally on port 5432):**
```bash
# Ensure PostgreSQL is running with db: sports_booking, user: postgres, pass: postgres
cd backend
.\mvnw.cmd spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:4200
```

### Local + Docker Workflow (no file edits needed)

This project supports both local and Docker using environment variables:

- Local backend default: `jdbc:postgresql://localhost:5432/sports_booking`
- Docker backend override: `jdbc:postgresql://postgres:5432/sports_booking` (from `docker-compose.yml`)

**Run locally (Windows PowerShell):**
```powershell
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="YOUR_LOCAL_POSTGRES_PASSWORD"
cd backend
.\mvnw.cmd spring-boot:run
```

**Run with Docker Compose:**
```powershell
docker compose up --build
```

**Stop Docker services:**
```powershell
docker compose down
```

**Reset Docker DB data (danger: deletes DB data):**
```powershell
docker compose down -v
```

---

## ☁️ Deployment Notes (Render + Vercel)

### Backend on Render
- **Root directory**: `backend`
- **Build command**: `./mvnw clean package -DskipTests`
- **Start command**: `java -jar target/*.jar`
- **Environment variables (recommended)**:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET`
  - `CORS_ALLOWED_ORIGINS` (set to your Vercel URL)

### Frontend on Vercel
- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Output directory**: `dist` (Angular default; Vercel auto-detects)


## 🔑 Default Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |

Register any new account to get USER role access.

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint         | Description     |
|--------|-----------------|-----------------|
| POST   | /auth/register  | Register user   |
| POST   | /auth/login     | Login → JWT     |

### Venues (GET = Public, Write = Admin Only)
| Method | Endpoint              | Description           |
|--------|----------------------|-----------------------|
| GET    | /venues              | List all venues       |
| GET    | /venues/{id}         | Get venue by ID       |
| GET    | /venues/sport/{type} | Filter by sport       |
| POST   | /venues              | Add venue (ADMIN)     |
| PUT    | /venues/{id}         | Update venue (ADMIN)  |
| DELETE | /venues/{id}         | Delete venue (ADMIN)  |

### Bookings (Authenticated)
| Method | Endpoint             | Description                |
|--------|---------------------|----------------------------|
| POST   | /booking/book       | Book a slot                |
| GET    | /booking/my         | My bookings                |
| GET    | /booking            | All bookings (ADMIN)       |
| GET    | /booking/venue/{id} | By venue (ADMIN)           |
| DELETE | /booking/{id}       | Cancel booking             |

---

## 🐳 Docker Services

| Service  | Port | Description             |
|----------|------|-------------------------|
| postgres | 5432 | PostgreSQL 16 database  |
| app      | 8080 | Spring Boot backend API |
| frontend | 80   | Angular app via nginx   |

---

## 🧱 Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | Angular 18, SCSS      |
| Backend   | Spring Boot 3.4.4, Java 21 |
| Auth      | Spring Security + JWT |
| Database  | PostgreSQL 16         |
| Container | Docker + Docker Compose |
| Web Server| Nginx (frontend)      |