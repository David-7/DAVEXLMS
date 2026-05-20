import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import courseService from '../../services/courseService';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    topics: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses();
      setCourses(response.data?.data || response.data || []);
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

  const openAddLessonModal = (course) => {
    setSelectedCourse(course);
    setEditingLesson(null);
    setLessonData({ title: '', description: '', topics: '' });
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = (course, lesson) => {
    setSelectedCourse(course);
    setEditingLesson(lesson);
    setLessonData({
      title: lesson.title,
      description: lesson.description,
      topics: lesson.topics?.map(t => t.title).join('\n') || '',
    });
    setIsLessonModalOpen(true);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const topics = lessonData.topics
        .split('\n')
        .filter((t) => t.trim())
        .map((title) => ({ title: title.trim(), isCovered: false }));

      if (editingLesson) {
        await courseService.updateLesson(selectedCourse._id, editingLesson._id, {
          title: lessonData.title,
          description: lessonData.description,
          topics,
        });
        toast.success('Lesson updated successfully');
      } else {
        await courseService.addLesson(selectedCourse._id, {
          title: lessonData.title,
          description: lessonData.description,
          topics,
        });
        toast.success('Lesson added successfully');
      }
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      setLessonData({ title: '', description: '', topics: '' });
      fetchCourses();
    } catch (error) {
      toast.error(editingLesson ? 'Failed to update lesson' : 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await courseService.deleteLesson(courseId, lessonId);
        toast.success('Lesson deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete lesson');
      }
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{course.name || course.title}</h3>
                    <p className="text-gray-400">{course.description}</p>
                  </div>
                  <button
                    onClick={() => openAddLessonModal(course)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Lesson
                  </button>
                </div>

                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-gray-100 dark:bg-dark-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditLessonModal(course, lesson)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Lesson"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(course._id, lesson._id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Lesson"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
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

      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setEditingLesson(null);
          setLessonData({ title: '', description: '', topics: '' });
        }}
        title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
      >
        <form onSubmit={handleAddLesson} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Title</label>
            <input
              type="text"
              value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={lessonData.description}
              onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
              className="input-field"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Topics (one per line)
            </label>
            <textarea
              value={lessonData.topics}
              onChange={(e) => setLessonData({ ...lessonData, topics: e.target.value })}
              className="input-field"
              rows="5"
              placeholder="Introduction to React&#10;Components and Props&#10;State Management"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsLessonModalOpen(false);
                setLessonData({ title: '', description: '', topics: '' });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Lesson
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Courses;
