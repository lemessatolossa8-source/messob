# Burayu MESOB Government Portal

Official government portal for Burayu City (MESOB). Built with Next.js 16 (frontend) and Express.js (backend) with MySQL database.

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Domain name with SSL certificate

### Environment Setup

1. **Backend (.env in backend/)**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=burayu_mesob
DB_PORT=3306

# JWT Secret (generate new one for production!)
JWT_SECRET=your_secure_random_secret_here

# Server Configuration
PORT=5000
NODE_ENV=production
```

2. **Frontend (.env.local)**
```env
# Backend API URL (use your production domain)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# JWT Secret (same as backend)
JWT_SECRET=your_secure_random_secret_here
```

### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/lemessatolossa8-source/messob.git
cd messob

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

2. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE burayu_mesob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Run database seeder (creates admin user and initial data)
cd backend
node seed.js
```

3. **Generate Secure JWT Secret**
```bash
# Generate a secure 128-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy this value to both `.env` files.

4. **Start Services**

**Development:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

**Production:**
```bash
# Backend (use PM2 or systemd)
cd backend
pm2 start server.js --name burayu-backend

# Frontend (build and serve)
npm run build
pm2 start npm --name burayu-frontend -- start
```

### Default Admin Access
- **Email:** admin@burayu.gov.et
- **Password:** password123

⚠️ **IMPORTANT:** Change this password immediately after first login!

### Security Features (All Implemented) ✓
- ✅ No hardcoded credentials or bypass tokens
- ✅ JWT-based authentication on all API routes
- ✅ Protected admin registration endpoint
- ✅ Helmet.js security headers
- ✅ Rate limiting on all endpoints
- ✅ CORS configured properly
- ✅ Database sync disabled in production
- ✅ Secure file upload handling
- ✅ Input validation and sanitization

### Styling (Official Standards) ✓
- ✅ Deep red header (#B82025)
- ✅ Consistent green buttons (#087443)
- ✅ Clean hero section (slide images only)
- ✅ No emojis in interface
- ✅ E-Service button in header only
- ✅ Location section in About page

## 📁 Project Structure
```
mesob/
├── backend/              # Express.js API server
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── services/        # API services
│   ├── lib/             # Utilities
│   └── proxy.js         # Auth middleware
└── public/              # Static assets
```

## 🔐 API Endpoints

### Public
- `POST /api/auth/login` - Admin login
- `GET /api/...` - All read operations

### Protected (Require JWT)
- `POST /api/auth/register` - Create admin (admin-only)
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/upload` - Upload file

## 🌐 Production Checklist

Before deploying to production:

1. ✅ Generate new JWT_SECRET
2. ✅ Update .env files with production values
3. ✅ Change default admin password
4. ✅ Configure SSL certificate
5. ✅ Set up database backups
6. ✅ Configure firewall rules
7. ✅ Set up monitoring and logging
8. ✅ Test all authentication flows
9. ✅ Review and adjust rate limits
10. ✅ Set NODE_ENV=production

## 🛠️ Tech Stack
- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Express.js, Sequelize ORM
- **Database:** MySQL 8.0
- **Security:** JWT, Helmet, CORS, Rate Limiting
- **Languages:** English, Amharic, Oromiffa

## 📝 License
Government of Ethiopia - Burayu City Administration

## 🤝 Support
For technical support, contact the IT department at Burayu City Administration.
