import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import config from './config/env.js';
import logger from './config/logger.js';
import connectDB from './database/connection.js';
import { initializeSocket } from './sockets/socketHandler.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initializeSocket(io);

app.set('io', io);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
