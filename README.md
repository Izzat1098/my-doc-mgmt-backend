# myDoc Document Management System - Backend

A production-ready document management system backend built with Nodejs, TypeScript, Express.js, MySQL, and AWS S3. The backend provides hierarchical folder/file organization, soft delete capabilities and AWS S3 object storage integration.

> **React/Nextjs Web Frontend Repository:** [https://github.com/Izzat1098/my-doc-mgmt-frontend](https://github.com/Izzat1098/my-doc-mgmt-frontend)


## 📑 Table of Contents

- [Features](#-features)
- [Technologies Used](#️-technologies-used)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [AWS S3 Integration](#️-aws-s3-integration)
- [Setup & Installation](#-setup--installation)
- [Code Quality](#-code-quality)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)


## ✨ Features

- ✅ **Hierarchical Folder Management**: Folder/file structure with unlimited nesting using parent-child relationships
- ✅ **Folder/File Search**: Search across all documents and folders
- ✅ **Soft Delete**: Recover deleted items from recycle bin
- ✅ **AWS S3 Integration**: Direct upload from client using presigned URLs
- ✅ **Type Safety**: Full TypeScript with strict type checking
- ✅ **Layered Architecture**: Clean separation of concerns
- ✅ **Error Handling**: Centralized error middleware
- ✅ **Code Quality**: ESLint + Prettier
- ✅ **Environment Config**: Secure environment-based configuration


## 🛠️ Technologies Used

### Core Technologies
- **Runtime**: Node.js
- **Language**: TypeScript 5
- **Framework**: Express.js 5
- **Database**: MySQL 8.0
- **Database Client**: mysql2 (Promise-based)
- **Cloud Storage**: AWS S3 (SDK v3)

### Development Tools
- **Build Tool**: tsx (development), tsc (production)
- **Linting**: ESLint
- **Formatting**: Prettier, auto-sort import plugin
- **Type Checking**: TypeScript strict mode


## 🏗 Architecture

### System Design

```
                 Request                   Save Data
┌─────────────┐         ┌─────────────────┐         ┌─────────┐
│   Client    │────────▶│  Backend API    │───────▶│  MySQL  │
│  (Frontend) │◀────────│   (TypeScript)  │         │Database │
└─────────────┘         └─────────────────┘         └─────────┘
      │      Presigned URL      │
      │       returned          │
      │                         │
      │                         │
      │ Direct upload           │
      │ to S3                   │
      ▼                         │
┌──────────────┐                │
│   AWS S3     │◀───────────────┘ Generates Presigned
│ File Storage │                   and File URLs
└──────────────┘
```

### Layered Architecture

```
┌─────────────────────────────────────────┐
│          Routes Layer                   │  ← API endpoint definitions
│  (routes/document.ts, routes/health.ts) │     URL mapping, route setup
├─────────────────────────────────────────┤
│          Middleware Layer               │  ← Cross-cutting concerns
│  (errorHandler, logger)                 │     Error handling, logging
├─────────────────────────────────────────┤
│          Controllers Layer              │  ← HTTP Request/Response handling
│  (controllers/document.ts, health.ts)   │     Input validation, status codes
├─────────────────────────────────────────┤
│          Services Layer                 │  ← Business logic + Data access
│  (services/document.ts, s3.ts)          │     SQL queries, type mapping,
│  (db/connection.ts, mapper functions)   │     AWS S3 operations, API-DB data transformations
├─────────────────────────────────────────┤
│          Database Layer                 │  ← Database (MysQL)
│  (db/schema.sql, dev_data.sql)          │     SQL commands, schema, developer testing data
└─────────────────────────────────────────┘
```

### Design Decisions

**1. Layered Architecture**
- **Why**: Separation of concerns, testability, maintainability
- Controllers handle HTTP, services contain business logic, services layer manages data access to Database

**2. Mapper Pattern (snake_case ↔ camelCase)**
- **Why**: Database uses snake_case, TypeScript uses camelCase
- **Implementation**: `mapDbRowToItem()` function transforms DB rows to TypeScript objects
- **Benefit**: Consistency in variable syntax in Backend to Client (React/Nextjs Frontend)

**3. Soft Delete**
- **Why**: Data recovery, audit trails, safety
- **Implementation**: `deleted_at` timestamp column indicates Deleted status, filtered in queries

**4. Presigned URLs for AWS S3**
- **Why**: Reduces server load, faster uploads, secure direct client-to-S3 file transfer
- **Flow**:
```
    Client → Backend (get Presigned URL) → S3
             Backend (store metadata + S3 file URL) → DB    
             Backend (send Presigned URL) → Client (upload file) → S3
```

**5. Promise-based mysql2**
- **Why**: Better async/await support, cleaner code than callbacks
- **Type Safety**: mysql2 RowDataPacket types with TypeScript


## 📁 Project Structure

```
my-doc-mgmt-backend/
├── src/
│   ├── config/
│   │   └── env.ts                    # Environment variable validation
│   │
│   ├── controllers/
│   │   ├── document.ts               # Document/folder CRUD endpoints
│   │   └── health.ts                 # Health check endpoint
│   │
│   ├── db/
│   │   ├── connection.ts             # MySQL connection pool
│   │   ├── schema.sql                # Database schema definition
│   │   ├── dev_data.sql              # Sample data for development
│   │   └── test.ts                   # DB connection test utility
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts           # Global error handling
│   │   └── logger.ts                 # Request logging
│   │
│   ├── routes/
│   │   ├── document.ts               # Document route definitions
│   │   └── health.ts                 # Health route definitions
│   │
│   ├── services/
│   │   ├── document.ts               # Document business logic functions
│   │   └── s3.ts                     # AWS S3 operations
│   │
│   ├── types/
│   │   └── item.ts                   # TypeScript type definitions
│   │
│   ├── app.ts                        # Express app configuration
│   └── index.ts                      # Server entry point
│
├── .env                              # Environment variables file for local development
├── .gitignore
├── .prettierrc                       # Prettier configuration
├── eslint.config.js                  # ESLint configuration
├── package.json
├── tsconfig.json                     # TypeScript configuration
└── README.md
```


## 🗄 Database Schema

The database uses a single `items` table with a self-referencing foreign key to create a tree structure.

**Key Points:**
- `parent_id` creates parent-child relationships (NULL = root level)
- `item_type` determines if it's a folder or file
- Soft delete using `deleted_at` timestamp
- Cascade delete removes children when parent is deleted

**Full schema**: See [src/db/schema.sql](src/db/schema.sql)  
**TypeScript types**: See [src/types/item.ts](src/types/item.ts)


## 🔌 API Endpoints

<details>
<summary><strong>📋 View All Endpoints (Click to expand)</strong></summary>

### Document Management

#### Get Documents
```http
GET /api/documents
GET /api/documents?title=search_term
GET /api/documents?parentId=5
```
**Description**: Get documents with optional filtering  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My Folder",
      "itemType": "folder",
      "parentId": null,
      "fileSizeKb": null,
      "s3Url": null,
      "createdBy": "admin",
      "deletedAt": null,
      "createdAt": "2026-01-13T...",
      "updatedAt": "2026-01-13T..."
    }
  ]
}
```

#### Get Document by ID
```http
GET /api/documents/:id
```
**Response**: `200 OK` | `404 Not Found`

#### Create Document/Folder
```http
POST /api/documents
Content-Type: application/json

{
  "title": "Project Files",
  "itemType": "folder",
  "parentId": null,
  "createdBy": "user@example.com"
}
```
**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": { /* item object */ },
  "uploadUrl": ""  // presigned URL (only for files)
}
```

#### Delete Document
```http
DELETE /api/documents/:id
```
**Description**: Soft delete (moves to recycle bin)  
**Response**: `200 OK`

#### Get Deleted Documents
```http
GET /api/documents/bin
```
**Description**: Get all soft-deleted items  
**Response**: `200 OK`

#### Restore Document
```http
PATCH /api/documents/:id/restore
```
**Description**: Restore item from recycle bin  
**Response**: `200 OK`

### System

#### Health Check
```http
GET /api/health
```
**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "uptime": 123.45,
  "environment": "development"
}
```

</details>



## ☁️ AWS S3 Integration

### File Upload Flow

1. **Client sends file metadata** to `POST /api/documents`
   ```json
   {
     "title": "report.pdf",
     "itemType": "file",
     "parentId": 5,
     "fileSizeKb": 2048
   }
   ```

2. **Backend generates presigned URL** and saves metadata
   - Creates database record with S3 file URL
   - Requests for Presigned URL from S3 (valid for 5 minutes)
   - Returns Presigned URL to client

3. **Client uploads directly to S3** using Presigned URL
   ```javascript
   fetch(uploadUrl, {
     method: 'PUT',
     body: file,
     headers: { 'Content-Type': file.type }
   });
   ```

4. **File is stored in S3**
   - Backend stores S3 file URL in database
   - Client can retrieve the S3 file URL from Backend

### Configuration

1. An **AWS account with S3 service** needs to be created.
1. A dedicated **S3 bucket** with public access, GetObject Policy and CORS policy.
1. Create **IAM user** that will have a new user policy to enable "PutObject" into the S3 bucket.
1. Using the IAM user, **create access key and secret access key** for programmatic access from Backend.
And of course, a valid credit card.


## 🚀 Setup & Installation

### Prerequisites

- Node.js 24+ and npm
- MySQL 8.0
- AWS Account with S3 service
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-doc-mgmt-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

#### Install MySQL

Check the documenntation here: https://dev.mysql.com/doc/refman/8.0/en/installing.html

#### Create Database and Table

Use the commands in `src/db/schema.sql` to create database and table. You can do this from the MySQL Workbench or MySQL CLI.


### 4. Configure Environment Variables

Copy `.env.example` file, edit in your actual values and rename to `.env`


### 5. Run the Application

#### Development Mode
```bash
npm run dev
```
Then navigate to http://localhost:8080

#### Production Build
```bash
npm run build
npm run start
```

### 7. Verify API is Running

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "uptime": 0.123,
  "environment": "development"
}
```


## 🔍 Code Quality

### Linting (ESLint)
Enforces code quality and Next.js best practices
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Configuration**: `eslint.config.js`
- TypeScript ESLint rules
- Unused variables with `_` prefix are allowed
- Strict type checking enabled

### Formatting (Prettier)
Ensures consistent code formatting
```bash
# Format all files
npm run format
```

**Configuration**: `.prettierrc`
- Use single quote
- Auto-sort import statements


## 🔮 Future Enhancements

The following are potential features that can be implemented to the application:

### User Management and Authentication
- User signup, login and authentication 
- Separation of documents based on users in Database

### Potential Caching Layers
To improve app performance and reduce Backend load and Database queries, we can do:
- Local in-memory caching for single-instance Backend server
- Redis integration (distributed cache) if there are multiple Backend servers

### Enhanced Testing
- Unit tests for individual functions
- Integration tests with dedicated test database
- End-to-end API testing

### Additional Features
- File versioning
- Share links with expiration
- Real-time notifications (WebSockets)
- Audit logs


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 👥 Contributing

Contributions are welcome! Please ensure:
1. All tests pass (`npm test`)
2. Code is linted (`npm run lint`)
3. Code is formatted (`npm run format`)
4. TypeScript compiles without errors (`npm run build`)


## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

