import { useState, useEffect } from 'react';
import { Trophy, Calendar, Award, Target, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import challengeService from '../../services/challengeService';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const Challenges = () => {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChallenges();
    
    const interval = setInterval(() => {
      fetchChallenges(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchChallenges = async (silent = false) => {
    try {
      const response = await api.get('/challenges');
      setChallenges(response.data?.data || response.data || []);
      if (!silent) setLoading(false);
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch challenges');
        setLoading(false);
      }
    }
  };

  const handleOpenChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setAnswer('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      await challengeService.submitChallenge(selectedChallenge._id, { answer: answer.trim() });
      toast.success('Challenge submitted successfully!');
      setIsModalOpen(false);
      setAnswer('');
      fetchChallenges(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const getMySubmission = (challenge) => {
    return challenge.submissions?.find(sub => sub.student === user?._id || sub.student?._id === user?._id);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', text: 'Pending' },
      correct: { icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', text: 'Correct' },
      partial: { icon: Award, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', text: 'Partial' },
      incorrect: { icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', text: 'Incorrect' },
    };
    return badges[status] || badges.pending;
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Challenges</h2>

        {challenges.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No challenges available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-purple-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded capitalize">
                      {challenge.type}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded capitalize">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Points</span>
                    <span className="font-semibold text-green-500">{challenge.points || 0} pts</span>
                  </div>
                  {challenge.expiryDate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Expires: {format(new Date(challenge.expiryDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                {(() => {
                  const submission = getMySubmission(challenge);
                  if (submission) {
                    const badge = getStatusBadge(submission.status);
                    const Icon = badge.icon;
                    return (
                      <div className="space-y-2">
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${badge.color}`}>
                          <Icon size={16} />
                          <span className="font-medium">{badge.text}</span>
                        </div>
                        {submission.pointsAwarded > 0 && (
                          <div className="text-center text-sm font-semibold text-green-600 dark:text-green-400">
                            +{submission.pointsAwarded} points earned!
                          </div>
                        )}
                        {submission.feedback && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-800 p-2 rounded">
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  const isExpired = new Date() > new Date(challenge.expiryDate);
                  return (
                    <button
                      onClick={() => handleOpenChallenge(challenge)}
                      disabled={isExpired}
                      className={`w-full btn-primary flex items-center justify-center gap-2 ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Send size={16} />
                      {isExpired ? 'Expired' : 'Submit Answer'}
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAnswer('');
        }}
        title={selectedChallenge?.title || 'Submit Challenge'}
      >
        {selectedChallenge && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Challenge Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedChallenge.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded capitalize">
                  {selectedChallenge.type}
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {selectedChallenge.points} points
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Answer {selectedChallenge.type === 'coding' && '(Paste your code)'}
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="input-field"
                  rows={selectedChallenge.type === 'coding' ? 10 : 6}
                  placeholder={
                    selectedChallenge.type === 'question' ? 'Type your answer here...' :
                    selectedChallenge.type === 'coding' ? 'Paste your code solution here...' :
                    selectedChallenge.type === 'troubleshooting' ? 'Describe your troubleshooting steps and solution...' :
                    'Describe your practical implementation...'
                  }
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Answer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setAnswer('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Challenges;
