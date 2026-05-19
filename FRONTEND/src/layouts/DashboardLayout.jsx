import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  Award,
  Calendar,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = () => {
    if (user?.role === 'student') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/student/courses' },
        { icon: Trophy, label: 'Challenges', path: '/student/challenges' },
        { icon: Award, label: 'Leaderboard', path: '/student/leaderboard' },
        { icon: Award, label: 'Certificates', path: '/student/certificates' },
        { icon: Bell, label: 'Announcements', path: '/student/announcements' },
        { icon: User, label: 'Profile', path: '/student/profile' },
      ];
    } else if (user?.role === 'instructor') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor/dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/instructor/courses' },
        { icon: Users, label: 'Students', path: '/instructor/students' },
      ];
    } else if (user?.role === 'admin' || user?.role === 'super_admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Students', path: '/admin/students' },
        { icon: Users, label: 'Instructors', path: '/admin/instructors' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: Trophy, label: 'Challenges', path: '/admin/challenges' },
        { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
      ];
    }
    return [];
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy-900 dark:bg-navy-950 border-b border-navy-800 dark:border-navy-900 px-4 py-3 flex items-center justify-between">
        <img src="/logo.png" alt="DAVEX" className="h-8" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-navy-900 dark:bg-navy-950 border-r border-navy-800 dark:border-navy-900 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-navy-800 dark:border-navy-900">
          <img src="/logo.png" alt="DAVEX LMS" className="h-12 mx-auto" />
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-navy-800 dark:hover:bg-navy-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-800 dark:border-navy-900 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 dark:text-gray-400 hover:bg-navy-800 dark:hover:bg-navy-900 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 bg-dark-950">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {user?.role?.replace('_', ' ')}
                {user?.plan === 'premium' && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full premium-gradient text-white">
                    Premium
                  </span>
                )}
              </p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
