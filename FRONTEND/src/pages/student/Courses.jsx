import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';

const Courses = () => {
  const { user, refreshUser } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await refreshUser();
      if (user?.assignedCourse) {
        fetchCourse();
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchCourse = async () => {
    try {
      const courseId = typeof user.assignedCourse === 'object' ? user.assignedCourse._id : user.assignedCourse;
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data?.data || response.data);
    } catch (error) {
      console.error('Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">No course assigned yet</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
          <div className="flex gap-4 text-sm">
            {course.duration && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                {course.duration}
              </span>
            )}
            {course.level && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded capitalize">
                {course.level}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Lessons</h3>
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, index) => (
              <div key={lesson._id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{lesson.title}</h4>
                </div>
                {lesson.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 ml-11">{lesson.description}</p>
                )}
                {lesson.topics && lesson.topics.length > 0 && (
                  <div className="ml-11 space-y-2">
                    {lesson.topics.map((topic) => (
                      <div key={topic._id} className="flex items-center gap-2">
                        {topic.isCovered ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <Circle className="text-gray-400" size={18} />
                        )}
                        <span className={topic.isCovered ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                          {topic.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No lessons added yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
