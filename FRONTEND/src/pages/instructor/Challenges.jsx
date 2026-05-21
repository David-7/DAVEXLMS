import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
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
    points: 1,
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
    
    if (formData.points > 4) {
      toast.error('Maximum points allowed is 4');
      return;
    }

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

  const handleDelete = async (challengeId) => {
    if (window.confirm('Delete this challenge? This action cannot be undone.')) {
      try {
        await challengeService.deleteChallenge(challengeId);
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
      points: 1,
      difficulty: 'beginner',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
    });
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Challenges</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Challenge
          </button>
        </div>

        {challenges.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No challenges created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{challenge.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(challenge)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(challenge._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{challenge.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded capitalize">
                    {challenge.type}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded capitalize">
                    {challenge.difficulty}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{challenge.points} pts</span>
                </div>
                {challenge.expiryDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Expires: {format(new Date(challenge.expiryDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingChallenge ? 'Edit Challenge' : 'Create Challenge'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points (Max: 4)</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Math.min(4, parseInt(e.target.value) || 1) })}
              className="input-field"
              min="1"
              max="4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingChallenge ? 'Update' : 'Create'} Challenge
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Challenges;
