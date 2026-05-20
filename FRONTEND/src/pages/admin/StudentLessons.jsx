import { useState, useEffect } from 'react';
import { CheckCircle, Circle, BookOpen } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';

const StudentLessons = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminService.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    if (student.assignedCourse) {
      try {
        const courseId = student.assignedCourse._id || student.assignedCourse;
        const response = await courseService.getCourse(courseId);
        setCourse(response.data?.data || response.data);
      } catch (error) {
        toast.error('Failed to fetch course');
      }
    }
  };

  const handleToggleTopic = async (lessonId, topicId, isCovered) => {
    if (!course) return;
    
    try {
      if (isCovered) {
        await courseService.unmarkTopicCovered(course._id, lessonId, topicId);
        toast.success('Topic unmarked');
      } else {
        await courseService.markTopicCovered(course._id, lessonId, topicId);
        toast.success('Topic marked as covered');
      }
      
      const response = await courseService.getCourse(course._id);
      setCourse(response.data?.data || response.data);
    } catch (error) {
      toast.error('Failed to update topic');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-600 dark:text-white">Manage Student Lessons</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Student</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => handleStudentSelect(student)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedStudent?._id === student._id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="font-medium">{student.fullName}</div>
                  <div className="text-sm opacity-75">{student.admissionNumber}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedStudent ? (
              <div className="card text-center py-12">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">Select a student to manage their lessons</p>
              </div>
            ) : !course ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No course assigned to this student</p>
              </div>
            ) : (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.name} - Lessons
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Student: {selectedStudent.fullName}
                </p>

                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h4>
                        </div>

                        {lesson.topics && lesson.topics.length > 0 && (
                          <div className="ml-11 space-y-2">
                            {lesson.topics.map((topic) => (
                              <div
                                key={topic._id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-700 cursor-pointer"
                                onClick={() => handleToggleTopic(lesson._id, topic._id, topic.isCovered)}
                              >
                                {topic.isCovered ? (
                                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                ) : (
                                  <Circle className="text-gray-400 flex-shrink-0" size={20} />
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
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No lessons added yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentLessons;
