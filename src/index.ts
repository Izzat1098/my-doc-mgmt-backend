import app from './app.js';
import { env } from './config/env.js';

const startServer = (): void => {
  try {
    app.listen(env.PORT, () => {
      console.log(`
┌─────────────────────────────────────────┐
│  🚀 Server is running!                  │
│                                         │
│  Environment: ${env.NODE_ENV.padEnd(27)}│
│  URL: http://${env.HOST}:${env.PORT.toString().padEnd(18)}│
│  API: http://${env.HOST}:${env.PORT}/api${' '.repeat(13)}│
│                                         │
│  Press CTRL-C to stop                   │
└─────────────────────────────────────────┘
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
};

startServer();
