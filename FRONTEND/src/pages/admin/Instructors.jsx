import { useState, useEffect } from 'react';
import { Plus, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import adminService from '../../services/adminService';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await adminService.getInstructors();
      setInstructors(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstructor) {
        await adminService.updateInstructor(editingInstructor._id, formData);
        toast.success('Instructor updated successfully');
      } else {
        await adminService.createInstructor(formData);
        toast.success('Instructor created successfully. Activation link sent to email.');
      }
      setIsModalOpen(false);
      resetForm();
      fetchInstructors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (instructor) => {
    if (window.confirm(`Delete ${instructor.fullName}? This action cannot be undone.`)) {
      try {
        await adminService.deleteStudent(instructor._id);
        toast.success('Instructor deleted successfully');
        fetchInstructors();
      } catch (error) {
        toast.error('Failed to delete instructor');
      }
    }
  };

  const handleBlock = async (instructor) => {
    try {
      if (instructor.status === 'blocked') {
        await adminService.unblockUser(instructor._id);
        toast.success('Instructor unblocked');
      } else {
        await adminService.blockUser(instructor._id);
        toast.success('Instructor blocked');
      }
      fetchInstructors();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      fullName: instructor.fullName,
      email: instructor.email,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingInstructor(null);
    setFormData({
      fullName: '',
      email: '',
    });
  };

  const columns = [
    {
      header: 'Account No',
      accessor: 'accountNumber',
      render: (row) => row.accountNumber || 'N/A',
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
          <h2 className="text-2xl font-bold text-white">Manage Instructors</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Instructor
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={instructors}
            searchPlaceholder="Search instructors..."
            onEdit={openEditModal}
            onDelete={handleDelete}
            actions={true}
          />
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {instructors.map((instructor) => (
              <button
                key={instructor._id}
                onClick={() => handleBlock(instructor)}
                className="text-sm px-3 py-1 rounded-lg bg-gray-200 dark:bg-dark-800 hover:bg-gray-300 dark:hover:bg-dark-700 flex items-center gap-1"
                title={instructor.status === 'blocked' ? 'Unblock' : 'Block'}
              >
                {instructor.status === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                {instructor.fullName}
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
        title={editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
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
              disabled={editingInstructor}
            />
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
              {editingInstructor ? 'Update' : 'Create'} Instructor
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Instructors;
