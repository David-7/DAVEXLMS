import { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import courseService from '../../services/courseService';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = async (courseId, lessonId, topicId, isCovered) => {
    try {
      if (isCovered) {
        await courseService.unmarkTopicCovered(courseId, lessonId, topicId);
        toast.success('Topic unmarked');
      } else {
        await courseService.markTopicCovered(courseId, lessonId, topicId);
        toast.success('Topic marked as covered');
      }
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update topic');
    }
  };

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
        <h2 className="text-2xl font-bold text-white">My Courses</h2>

        {courses.length === 0 ? (
          <div className="card">
            <p className="text-gray-500">No courses assigned yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course._id} className="card">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>

                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-gray-100 dark:bg-dark-800 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {lesson.title}
                        </h4>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {lesson.description}
                          </p>
                        )}

                        {lesson.topics && lesson.topics.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Topics:
                            </p>
                            {lesson.topics.map((topic) => (
                              <div
                                key={topic._id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-200 dark:hover:bg-dark-700 cursor-pointer"
                                onClick={() =>
                                  handleToggleTopic(
                                    course._id,
                                    lesson._id,
                                    topic._id,
                                    topic.isCovered
                                  )
                                }
                              >
                                {topic.isCovered ? (
                                  <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                  <Circle className="text-gray-400" size={20} />
                                )}
                                <span
                                  className={`${
                                    topic.isCovered
                                      ? 'text-gray-500 dark:text-gray-500 line-through'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {topic.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No topics added yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No lessons added yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
