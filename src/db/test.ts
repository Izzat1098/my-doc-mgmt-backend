import { pool } from './connection.js';

/**
 * Test database connection
 * @returns Promise that resolves if connection is successful
 * @throws Error if connection fails
 */
export async function testDbConnection(): Promise<void> {
  try {
    // Test using the shared pool
    await pool.execute('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Failed to connect to database');
  }
}
