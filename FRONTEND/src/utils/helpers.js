import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRoleColor = (role) => {
  const colors = {
    super_admin: 'text-red-500',
    admin: 'text-purple-500',
    instructor: 'text-blue-500',
    student: 'text-green-500',
  };
  return colors[role] || 'text-gray-500';
};

export const getPlanBadge = (plan) => {
  return plan === 'premium' 
    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-500',
    pending: 'text-yellow-500',
    blocked: 'text-red-500',
    suspended: 'text-orange-500',
  };
  return colors[status] || 'text-gray-500';
};

export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
