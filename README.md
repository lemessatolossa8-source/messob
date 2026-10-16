# Burayu MESOB Portal

Official online public service portal for Shaggar City Administration & Burayu Branch.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Other:** Cloudinary (for optional media storage), JWT (for authentication)

## Project Structure

```text
mesob/
├── backend/        # Express.js REST API
├── database/       # Database scripts and seeders
├── frontend/       # Next.js web application
├── .gitignore      # Ignored files
└── README.md       # Project documentation
```

## Setup Instructions

### 1. MySQL Setup
1. Ensure MySQL is running on your machine (e.g., via Laragon, XAMPP, or natively).
2. Create a new database named `burayu_mesob` (or your preferred name).
3. The tables will be synchronized automatically by Sequelize on startup.
4. To create the default admin user, you can run the seed script later.

### 2. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=burayu_mesob
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAIL=admin@example.com
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Seed the database (creates the default admin user):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

## Accessing the Application

- **Public Site:** `http://localhost:3000`
- **Admin Dashboard:** `http://localhost:3000/admin/login`
- **Backend API:** `http://localhost:5000`
