import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import challengeService from '../../services/challengeService';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'question',
    points: 10,
    difficulty: 'beginner',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await challengeService.getChallenges();
      setChallenges(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChallenge) {
        await challengeService.updateChallenge(editingChallenge._id, formData);
        toast.success('Challenge updated successfully');
      } else {
        await challengeService.createChallenge(formData);
        toast.success('Challenge created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (challenge) => {
    if (window.confirm(`Delete ${challenge.title}? This action cannot be undone.`)) {
      try {
        await challengeService.deleteChallenge(challenge._id);
        toast.success('Challenge deleted successfully');
        fetchChallenges();
      } catch (error) {
        toast.error('Failed to delete challenge');
      }
    }
  };

  const openEditModal = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type || 'question',
      points: challenge.points,
      difficulty: challenge.difficulty,
      startDate: challenge.startDate ? format(new Date(challenge.startDate), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      expiryDate: challenge.expiryDate ? format(new Date(challenge.expiryDate), 'yyyy-MM-dd') : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingChallenge(null);
    setFormData({
      title: '',
      description: '',
      type: 'question',
      points: 10,
      difficulty: 'beginner',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
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
      header: 'Points',
      accessor: 'points',
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
          row.difficulty === 'easy' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : row.difficulty === 'medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.difficulty}
        </span>
      ),
    },
    {
      header: 'Deadline',
      accessor: 'deadline',
      render: (row) => row.deadline ? format(new Date(row.deadline), 'MMM dd, yyyy') : 'No deadline',
    },
    {
      header: 'Submissions',
      accessor: 'submissions',
      render: (row) => row.submissions?.length || 0,
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
          <h2 className="text-2xl font-bold text-white">Manage Challenges</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Challenge
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={challenges}
            searchPlaceholder="Search challenges..."
            onEdit={openEditModal}
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
        title={editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Challenge Title</label>
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
            <label className="block text-sm font-medium mb-2">Points</label>
            <input
              type="number"
              required
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
            >
              <option value="question">Question</option>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="practical">Practical</option>
              <option value="coding">Coding</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date</label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="input-field"
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
              {editingChallenge ? 'Update' : 'Create'} Challenge
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Challenges;
