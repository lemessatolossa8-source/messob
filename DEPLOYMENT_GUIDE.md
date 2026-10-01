# Burayu MESOB - Complete Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Git installed

### Step 1: Clone the Repository
```bash
git clone https://github.com/lemessatolossa8-source/messob.git
cd messob
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# OR on Linux/Mac: cp .env.example .env

# Edit .env file with your database credentials
```

**Edit `backend/.env`:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=burayu_mesob

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Create MySQL Database:**
```sql
-- Open MySQL and run:
CREATE DATABASE burayu_mesob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Start Backend Server:**
```bash
# Make sure you're in backend folder
node server.js
```

You should see:
```
🚀 Burayu MESOB API running on http://localhost:5000
✅ MySQL connected: burayu_mesob
```

### Step 3: Setup Frontend

**Open a NEW terminal window:**

```bash
# Navigate to project root
cd messob

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local
# OR on Linux/Mac: cp .env.local.example .env.local
```

**Edit `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start Frontend Server:**
```bash
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### Step 4: Access the Website

**Public Website:**
```
http://localhost:3000
```

**Admin Panel:**
```
http://localhost:3000/admin/login

Default Credentials:
Email: admin@burayu.gov.et
Password: password123
```

---

## 📋 Full Setup Commands

### Windows (PowerShell)

```powershell
# 1. Clone Repository
git clone https://github.com/lemessatolossa8-source/messob.git
cd messob

# 2. Setup Backend
cd backend
npm install
copy .env.example .env
# Edit .env with your settings
node server.js

# 3. In NEW Terminal - Setup Frontend
cd ..
npm install
copy .env.local.example .env.local
# Edit .env.local
npm run dev
```

### Linux/Mac (Bash)

```bash
# 1. Clone Repository
git clone https://github.com/lemessatolossa8-source/messob.git
cd messob

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
node server.js

# 3. In NEW Terminal - Setup Frontend
cd ..
npm install
cp .env.local.example .env.local
# Edit .env.local
npm run dev
```

---

## 🗄️ Database Setup

### Initial Database Creation

```sql
-- 1. Create Database
CREATE DATABASE burayu_mesob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Use Database
USE burayu_mesob;

-- Tables will be created automatically by Sequelize
```

### Seed Initial Admin User

```bash
# In backend folder
node seed.js
```

This creates:
- ✅ Admin user: `admin@burayu.gov.et` / `password123`
- ✅ Database tables (users, news, announcements, etc.)

---

## 📁 Project Structure

```
messob/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js              # MySQL connection
│   ├── controllers/           # Business logic
│   ├── models/                # Sequelize models
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, error handling
│   ├── uploads/               # Uploaded images
│   ├── .env                   # Environment config
│   ├── server.js              # Entry point
│   └── seed.js                # Database seeder
│
├── src/                       # Next.js Frontend
│   ├── app/                   # Pages (App Router)
│   │   ├── page.js           # Homepage
│   │   ├── admin/            # Admin panel
│   │   ├── news/             # News pages
│   │   ├── services/         # Services pages
│   │   └── ...
│   ├── components/           # React components
│   ├── context/              # React context
│   ├── services/             # API services
│   ├── i18n/                 # Translations
│   └── lib/                  # Utilities
│
├── public/                   # Static assets
│   ├── images/              # Logo, etc.
│   └── uploads/             # User uploads
│
├── .env.local               # Frontend env
└── package.json             # Dependencies
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=burayu_mesob

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🌐 Running Both Servers

You need **TWO terminal windows** running simultaneously:

### Terminal 1 - Backend
```bash
cd backend
node server.js
```
Runs on: `http://localhost:5000`

### Terminal 2 - Frontend
```bash
npm run dev
```
Runs on: `http://localhost:3000`

**Important:** Both must be running for the website to work!

---

## 🔐 Admin Panel Access

1. Open browser: `http://localhost:3000/admin/login`
2. Login with:
   - Email: `admin@burayu.gov.et`
   - Password: `password123`
3. Change password in Settings after first login

### Admin Features
- ✅ News Management
- ✅ Announcements
- ✅ Projects
- ✅ Gallery
- ✅ Slide Images
- ✅ Services
- ✅ Mayor Message
- ✅ City Information
- ✅ Settings

---

## 🔄 Database Tables

Tables created automatically by Sequelize:

```
- users              (admins)
- news               (news articles)
- announcements      (announcements)
- projects           (infrastructure projects)
- services           (municipal services)
- branches           (office branches)
- contacts           (contact form submissions)
- settings           (website settings)
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "connect ECONNREFUSED"**
- ✅ Check MySQL is running
- ✅ Verify database credentials in `.env`
- ✅ Ensure database `burayu_mesob` exists

**Error: "JWT_SECRET must be set"**
- ✅ Add `JWT_SECRET` to `backend/.env`

**Error: "Port 5000 already in use"**
- ✅ Change `PORT=5000` to another port in `.env`
- ✅ Or kill process using port 5000

### Frontend Won't Start

**Error: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: "Failed to fetch"**
- ✅ Check backend is running on port 5000
- ✅ Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Database Issues

**Tables not created:**
```bash
cd backend
node seed.js
```

**Reset database:**
```sql
DROP DATABASE burayu_mesob;
CREATE DATABASE burayu_mesob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Then run `node seed.js` again.

---

## 📦 Dependencies

### Backend
- Express.js - Web framework
- Sequelize - ORM for MySQL
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- multer - File uploads
- cors - CORS handling
- helmet - Security headers

### Frontend
- Next.js 15 - React framework
- React 19 - UI library
- Tailwind CSS - Styling
- Lucide React - Icons
- dompurify - XSS prevention

---

## 🚀 Production Deployment

### 1. Update Environment Variables

**Backend:**
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
JWT_SECRET=your-super-secret-production-key
CLIENT_URL=https://yourdomain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. Build Frontend

```bash
npm run build
npm start
```

### 3. Run Backend with PM2

```bash
cd backend
npm install -g pm2
pm2 start server.js --name burayu-api
pm2 save
pm2 startup
```

### 4. Setup Reverse Proxy (Nginx)

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Port Summary

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Frontend | 3000 | http://localhost:3000    |
| Backend  | 5000 | http://localhost:5000    |
| MySQL    | 3306 | localhost:3306           |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MySQL database created
- [ ] Admin login works
- [ ] Homepage loads
- [ ] Language selector works
- [ ] News page shows content
- [ ] Admin can create news
- [ ] Images upload successfully
- [ ] Settings page loads

---

## 🆘 Getting Help

If you encounter issues:

1. Check backend terminal for errors
2. Check frontend terminal for errors
3. Check browser console (F12)
4. Verify both servers are running
5. Verify database connection

---

## 📝 Quick Reference

### Start Development
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
npm run dev
```

### Access Points
- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login
- **API:** http://localhost:5000/api

### Default Admin
- **Email:** admin@burayu.gov.et
- **Password:** password123

---

## 🎉 Success!

If both servers are running and you can login to admin panel, your setup is complete!

Now you can:
- ✅ Add news articles
- ✅ Create announcements
- ✅ Upload images to gallery
- ✅ Manage services
- ✅ Update site settings
- ✅ Customize content in 3 languages

**Remember:** Keep both terminal windows open while using the website!
