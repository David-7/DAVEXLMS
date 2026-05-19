import { useState, useEffect } from 'react';
import { Award, Plus, User, BookOpen } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    title: '',
    description: '',
    certificateUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certsRes, studentsRes, coursesRes] = await Promise.all([
        api.get('/certificates/my-certificates').catch(() => ({ data: { data: [] } })),
        api.get('/instructor/students').catch(() => ({ data: { data: [] } })),
        api.get('/courses').catch(() => ({ data: { data: [] } })),
      ]);
      
      setCertificates(certsRes.data?.data || []);
      setStudents(studentsRes.data?.data || studentsRes.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', formData);
      toast.success('Certificate issued successfully');
      setIsModalOpen(false);
      setFormData({ student: '', course: '', title: '', description: '', certificateUrl: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to issue certificate');
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Issue Certificate
          </button>
        </div>

        {certificates.length === 0 ? (
          <div className="card text-center py-12">
            <Award className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No certificates issued yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="text-yellow-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{cert.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span>{cert.student?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen size={16} />
                    <span>{cert.course?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ student: '', course: '', title: '', description: '', certificateUrl: '' });
        }}
        title="Issue Certificate"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student</label>
            <select
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.name || course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Certificate Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Certificate of Completion"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="For successfully completing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Certificate URL (optional)</label>
            <input
              type="url"
              value={formData.certificateUrl}
              onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ student: '', course: '', title: '', description: '', certificateUrl: '' });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Issue Certificate
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Certificates;
