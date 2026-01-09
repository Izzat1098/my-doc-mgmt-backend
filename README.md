# My Doc Management Backend

Modern, secure Express.js API built with TypeScript.

## 🚀 Features

- ✅ TypeScript with strict type checking
- ✅ Express.js for routing
- ✅ Security best practices (Helmet, CORS, Rate Limiting)
- ✅ Error handling middleware
- ✅ Environment-based configuration
- ✅ Request logging
- ✅ Compression enabled
- ✅ Drizzle ORM for database management

## 📁 Project Structure

```
my-doc-mgmt-backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── env.ts       # Environment variables handler
│   ├── controllers/     # Route controllers
│   │   └── health.controller.ts
│   ├── middlewares/     # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/          # API routes
│   │   └── health.routes.ts
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── db/              # Database configuration
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install helmet cors express-rate-limit compression express-validator
   npm install -D @types/cors @types/compression
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Then update the `.env` file with your actual values.

3. **Run in development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run in production:**
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server health status
  - Response:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-01-09T...",
      "uptime": 123.45,
      "environment": "development"
    }
    ```

## 🔒 Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes by default)
- **Body Size Limits**: 10MB max payload
- **Input Validation**: Using express-validator

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🗄️ Database

This project uses Drizzle ORM with MySQL. Configure your database connection in the `.env` file.

## 📄 License

ISC
