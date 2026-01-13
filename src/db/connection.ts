import { env } from '../config/env.js';
import mysql from 'mysql2/promise';

/**
 * Database connection pool
 * Shared across all services for efficient connection management
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
