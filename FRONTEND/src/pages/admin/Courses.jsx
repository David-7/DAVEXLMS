import { useState, useEffect } from 'react';
import { Plus, BookOpen, List } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import courseService from '../../services/courseService';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
  });
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
      setCourses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id, formData);
        toast.success('Course updated successfully');
      } else {
        await courseService.createCourse(formData);
        toast.success('Course created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      const topics = lessonData.topics.split('\n').filter(t => t.trim()).map(title => ({
        title: title.trim(),
        isCovered: false,
      }));

      await courseService.addLesson(selectedCourse._id, {
        title: lessonData.title,
        description: lessonData.description,
        topics,
      });
      toast.success('Lesson added successfully');
      setIsLessonModalOpen(false);
      resetLessonForm();
      fetchCourses();
    } catch (error) {
      toast.error('Failed to add lesson');
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Delete ${course.title}? This action cannot be undone.`)) {
      try {
        await courseService.deleteCourse(course._id);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration || '',
      level: course.level || 'beginner',
    });
    setIsModalOpen(true);
  };

  const openLessonModal = (course) => {
    setSelectedCourse(course);
    setIsLessonModalOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      duration: '',
      level: 'beginner',
    });
  };

  const resetLessonForm = () => {
    setSelectedCourse(null);
    setLessonData({
      title: '',
      description: '',
      topics: '',
    });
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => row.description?.substring(0, 50) + '...' || 'N/A',
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => row.duration || 'N/A',
    },
    {
      header: 'Level',
      accessor: 'level',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
          {row.level || 'beginner'}
        </span>
      ),
    },
    {
      header: 'Lessons',
      accessor: 'lessons',
      render: (row) => row.lessons?.length || 0,
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Manage Courses</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={courses}
            searchPlaceholder="Search courses..."
            onEdit={openEditModal}
            onDelete={handleDelete}
            actions={true}
          />
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {courses.map((course) => (
              <button
                key={course._id}
                onClick={() => openLessonModal(course)}
                className="text-sm px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1"
                title="Add Lesson"
              >
                <List size={16} />
                Add Lesson to {course.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (e.g., 3 months)</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCourse ? 'Update' : 'Create'} Course
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          resetLessonForm();
        }}
        title={`Add Lesson to ${selectedCourse?.title}`}
      >
        <form onSubmit={handleLessonSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Title</label>
            <input
              type="text"
              required
              value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={lessonData.description}
              onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Topics (one per line)</label>
            <textarea
              required
              value={lessonData.topics}
              onChange={(e) => setLessonData({ ...lessonData, topics: e.target.value })}
              className="input-field"
              rows={6}
              placeholder="Introduction to HTML&#10;HTML Tags and Elements&#10;HTML Forms"
            />
            <p className="text-xs text-gray-500 mt-1">Enter each topic on a new line</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsLessonModalOpen(false);
                resetLessonForm();
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
