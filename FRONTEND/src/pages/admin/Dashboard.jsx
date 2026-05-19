import { useState, useEffect } from 'react';
import { Users, BookOpen, Trophy, Bell } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalChallenges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Instructors',
      value: stats.totalInstructors || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Challenges',
      value: stats.totalChallenges || 0,
      icon: Trophy,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                Create New Student
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                Create New Instructor
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                Create New Course
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                Create New Challenge
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Students</span>
                <span className="font-semibold text-white">{stats.activeStudents || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Instructors</span>
                <span className="font-semibold text-white">{stats.activeInstructors || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Premium Students</span>
                <span className="font-semibold text-white">{stats.premiumStudents || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pending Activations</span>
                <span className="font-semibold text-white">{stats.pendingActivations || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
