import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import adminService from '../../services/adminService';
import courseService from '../../services/courseService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    admissionNumber: '',
    assignedCourse: '',
    assignedInstructor: '',
    plan: 'basic',
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchInstructors();
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

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses();
      setCourses(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses');
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await adminService.getInstructors();
      setInstructors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch instructors');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await adminService.updateStudent(editingStudent._id, formData);
        toast.success('Student updated successfully');
      } else {
        await adminService.createStudent(formData);
        toast.success('Student created successfully. Activation link sent to email.');
      }
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Delete ${student.fullName}? This action cannot be undone.`)) {
      try {
        await adminService.deleteStudent(student._id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleBlock = async (student) => {
    try {
      if (student.status === 'blocked') {
        await adminService.unblockUser(student._id);
        toast.success('Student unblocked');
      } else {
        await adminService.blockUser(student._id);
        toast.success('Student blocked');
      }
      fetchStudents();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleUpgradePremium = async (student) => {
    try {
      await adminService.upgradeToPremium(student._id);
      toast.success('Student upgraded to premium');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to upgrade');
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      admissionNumber: student.admissionNumber || '',
      assignedCourse: student.assignedCourse?._id || '',
      plan: student.plan,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      email: '',
      admissionNumber: '',
      assignedCourse: '',
      plan: 'basic',
    });
  };

  const columns = [
    {
      header: 'Admission No',
      accessor: 'admissionNumber',
      render: (row) => row.admissionNumber || 'N/A',
    },
    {
      header: 'Name',
      accessor: 'fullName',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Course',
      accessor: 'assignedCourse',
      render: (row) => row.assignedCourse?.name || row.assignedCourse?.title || 'Not Assigned',
    },
    {
      header: 'Instructor',
      accessor: 'assignedInstructor',
      render: (row) => row.assignedInstructor?.fullName || 'Not Assigned',
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.plan === 'premium' 
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {row.plan}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : row.status === 'blocked'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {row.status}
        </span>
      ),
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
          <h2 className="text-2xl font-bold text-white">Manage Students</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Student
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={students}
            searchPlaceholder="Search students..."
            onEdit={openEditModal}
            onDelete={handleDelete}
            actions={true}
          />
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {students.map((student) => (
              <div key={student._id} className="flex gap-2">
                <button
                  onClick={() => handleBlock(student)}
                  className="text-sm px-3 py-1 rounded-lg bg-gray-200 dark:bg-dark-800 hover:bg-gray-300 dark:hover:bg-dark-700 flex items-center gap-1"
                  title={student.status === 'blocked' ? 'Unblock' : 'Block'}
                >
                  {student.status === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                </button>
                {student.plan !== 'premium' && (
                  <button
                    onClick={() => handleUpgradePremium(student)}
                    className="text-sm px-3 py-1 rounded-lg bg-yellow-200 dark:bg-yellow-900/30 hover:bg-yellow-300 dark:hover:bg-yellow-900/50 flex items-center gap-1"
                    title="Upgrade to Premium"
                  >
                    <Crown size={16} />
                  </button>
                )}
              </div>
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
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              disabled={editingStudent}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admission Number</label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="e.g., DAVEX/2024/001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assign Course</label>
            <select
              value={formData.assignedCourse}
              onChange={(e) => setFormData({ ...formData, assignedCourse: e.target.value })}
              className="input-field"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name || course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assign Instructor</label>
            <select
              value={formData.assignedInstructor}
              onChange={(e) => setFormData({ ...formData, assignedInstructor: e.target.value })}
              className="input-field"
            >
              <option value="">Select Instructor (Optional)</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="input-field"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
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
              {editingStudent ? 'Update' : 'Create'} Student
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Students;
