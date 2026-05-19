import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import announcementService from '../../services/announcementService';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(formData);
      toast.success('Announcement created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (announcement) => {
    if (window.confirm(`Delete "${announcement.title}"? This action cannot be undone.`)) {
      try {
        await announcementService.deleteAnnouncement(announcement._id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      targetAudience: 'all',
    });
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Content',
      accessor: 'content',
      render: (row) => row.content?.substring(0, 60) + '...' || 'N/A',
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
          row.priority === 'high' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : row.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Audience',
      accessor: 'targetAudience',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 capitalize">
          {row.targetAudience}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
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
          <h2 className="text-2xl font-bold text-white">Manage Announcements</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Announcement
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={announcements}
            searchPlaceholder="Search announcements..."
            onDelete={handleDelete}
            actions={true}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add New Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="input-field"
            >
              <option value="all">All Users</option>
              <option value="student">Students Only</option>
              <option value="instructor">Instructors Only</option>
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
              Create Announcement
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Announcements;
