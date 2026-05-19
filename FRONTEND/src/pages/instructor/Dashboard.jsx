import { useState, useEffect } from 'react';
import { BookOpen, Users, Trophy } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import courseService from '../../services/courseService';
import api from '../../api/axios';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        courseService.getCourses(),
        api.get('/instructor/students'),
      ]);
      setCourses(coursesRes.data || []);
      setStudents(studentsRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'My Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'My Students',
      value: students.length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Active Challenges',
      value: 0,
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
        <h2 className="text-2xl font-bold text-white">Instructor Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h3 className="text-lg font-semibold mb-4 text-white">My Courses</h3>
            {courses.length === 0 ? (
              <p className="text-gray-500">No courses assigned yet</p>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course._id}
                    className="p-3 rounded-lg bg-gray-100 dark:bg-dark-800"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.lessons?.length || 0} lessons
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Students</h3>
            {students.length === 0 ? (
              <p className="text-gray-500">No students assigned yet</p>
            ) : (
              <div className="space-y-2">
                {students.slice(0, 5).map((student) => (
                  <div
                    key={student._id}
                    className="p-3 rounded-lg bg-gray-100 dark:bg-dark-800"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
