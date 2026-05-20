import { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (silent = false) => {
    try {
      const response = await api.get('/chat/messages?room=general&limit=100');
      setMessages(response.data?.data || []);
      if (!silent) setLoading(false);
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch messages');
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await api.post('/chat/messages', {
        content: message,
        room: 'general',
      });
      setMessage('');
      fetchMessages(true);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="card h-[calc(100vh-12rem)] flex flex-col">
        <h2 className="text-2xl font-bold text-green-600 dark:text-white mb-4">Community Chat</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg ${
                  msg.sender?._id === user?._id
                    ? 'bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]'
                    : 'bg-gray-100 dark:bg-dark-800 mr-auto max-w-[80%]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {msg.sender?.fullName || 'Unknown'}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-400 capitalize">
                    {msg.sender?.role || 'user'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-gray-900 dark:text-white break-words">{msg.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-700">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="input-field flex-1"
            placeholder="Type a message..."
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
