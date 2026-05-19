import { useState, useEffect } from 'react';
import { Users, BookOpen, Trophy, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data || {});
      
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      
      const mockActivity = Array.from({ length: weeksInMonth }, (_, i) => ({
        name: `Week ${i + 1}`,
        students: Math.floor(Math.random() * 20) + (i * 10),
        courses: Math.floor(Math.random() * 5) + (i * 2),
        challenges: Math.floor(Math.random() * 8) + (i * 3),
      }));
      setActivityData(mockActivity);
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

          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Activity (Resets on 1st)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Students"
                />
                <Line
                  type="monotone"
                  dataKey="courses"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  name="Courses"
                />
                <Line
                  type="monotone"
                  dataKey="challenges"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  name="Challenges"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 text-sm justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-400">Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
