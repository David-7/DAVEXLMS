import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthStore } from '../store/useAuthStore';
import { useSocket } from '../hooks/useSocket';

const Chat = () => {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.emit('join-room', { room: 'general', userId: user?._id });

      socket.on('new-message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      sender: user?._id,
      content: newMessage,
      room: 'general',
    });

    setNewMessage('');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">General Chat</h2>
          <p className="text-gray-400 text-sm">Chat with other students and instructors</p>
        </div>

        <div className="flex-1 bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.sender?._id === user?._id;
                return (
                  <div
                    key={index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 dark:bg-dark-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1">
                          {message.sender?.fullName || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-dark-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={20} />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
