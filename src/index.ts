import app from './app.js';
import { env } from './config/env.js';
import { testDbConnection } from './db/test.js';

async function startServer(): Promise<void> {
  try {
    // Test database connection before starting server
    await testDbConnection();

    app.listen(env.PORT, () => {
      console.log(`
X─────────────────────────────────────────X
  🚀 Server is running!                  
                                         
  Environment: ${env.NODE_ENV.padEnd(27)}
  URL: http://${env.HOST}:${env.PORT.toString()}
  API: http://${env.HOST}:${env.PORT}/api
                                         
  Press CTRL-C to stop                   
X─────────────────────────────────────────X
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
