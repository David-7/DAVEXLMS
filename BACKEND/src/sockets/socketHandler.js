import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join-room', ({ room, roomId, userId }) => {
      const roomName = roomId ? `${room}-${roomId}` : room;
      socket.join(roomName);
      socket.userId = userId;
      logger.info(`User ${userId} joined room: ${roomName}`);
    });

    socket.on('leave-room', ({ room, roomId }) => {
      const roomName = roomId ? `${room}-${roomId}` : room;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left room: ${roomName}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { sender, content, room, roomId } = data;

        if (!content || content.trim().length === 0) {
          return socket.emit('error', { message: 'Message content is required' });
        }

        if (content.length > 2000) {
          return socket.emit('error', { message: 'Message too long' });
        }

        const message = await Message.create({
          sender,
          content: content.trim(),
          room,
          roomId: roomId || null,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'fullName profilePhoto role'
        );

        const roomName = roomId ? `${room}-${roomId}` : room;
        io.to(roomName).emit('new-message', populatedMessage);

        logger.info(`Message sent to room ${roomName} by user ${sender}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ room, roomId, user }) => {
      const roomName = roomId ? `${room}-${roomId}` : room;
      socket.to(roomName).emit('user-typing', { user });
    });

    socket.on('stop-typing', ({ room, roomId, user }) => {
      const roomName = roomId ? `${room}-${roomId}` : room;
      socket.to(roomName).emit('user-stop-typing', { user });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitNotification = (io, userId, notification) => {
  io.to(`user-${userId}`).emit('new-notification', notification);
};

export const emitLeaderboardUpdate = (io) => {
  io.emit('leaderboard-updated');
};

export const emitAnnouncement = (io, announcement) => {
  io.emit('new-announcement', announcement);
};
