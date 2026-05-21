import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import challengeService from '../../services/challengeService';
import toast from 'react-hot-toast';

const Submissions = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeData, setGradeData] = useState({
    pointsAwarded: 0,
    status: 'correct',
    feedback: '',
  });

  useEffect(() => {
    fetchChallenges();
    
    const interval = setInterval(() => {
      fetchChallenges(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchChallenges = async (silent = false) => {
    try {
      const response = await challengeService.getChallenges();
      const challengesData = response.data || [];
      const challengesWithSubmissions = challengesData.filter(c => c.submissions && c.submissions.length > 0);
      setChallenges(challengesWithSubmissions);
      if (!silent) setLoading(false);
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch challenges');
        setLoading(false);
      }
    }
  };

  const handleOpenGrading = (challenge, submission) => {
    setSelectedChallenge(challenge);
    setSelectedSubmission(submission);
    setGradeData({
      pointsAwarded: challenge.points,
      status: 'correct',
      feedback: '',
    });
    setIsModalOpen(true);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    
    if (gradeData.pointsAwarded > selectedChallenge.points) {
      toast.error(`Points cannot exceed ${selectedChallenge.points}`);
      return;
    }

    setGrading(true);
    try {
      await challengeService.gradeSubmission(
        selectedChallenge._id,
        selectedSubmission._id,
        gradeData
      );
      toast.success('Submission graded successfully!');
      setIsModalOpen(false);
      fetchChallenges(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
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

  const getPendingCount = (challenge) => {
    return challenge.submissions?.filter(s => s.status === 'pending').length || 0;
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Challenge Submissions</h2>

        {challenges.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {challenge.submissions.length} submission(s) • {getPendingCount(challenge)} pending
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded capitalize text-sm">
                      {challenge.type}
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm font-semibold">
                      {challenge.points} pts
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {challenge.submissions.map((submission) => {
                    const badge = getStatusBadge(submission.status);
                    const Icon = badge.icon;
                    return (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {submission.student?.fullName || 'Student'}
                            </span>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${badge.color}`}>
                              <Icon size={12} />
                              <span>{badge.text}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {submission.pointsAwarded > 0 && (
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                              Points Awarded: {submission.pointsAwarded}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenGrading(challenge, submission)}
                          className={`btn-primary flex items-center gap-2 ${submission.status !== 'pending' ? 'opacity-50' : ''}`}
                          disabled={submission.status !== 'pending'}
                        >
                          <Eye size={16} />
                          {submission.status === 'pending' ? 'Grade' : 'View'}
                        </button>
                      </div>
                    );
                  })}
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
          setGradeData({ pointsAwarded: 0, status: 'correct', feedback: '' });
        }}
        title={`Grade Submission - ${selectedChallenge?.title}`}
      >
        {selectedSubmission && selectedChallenge && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Student Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Name:</strong> {selectedSubmission.student?.fullName || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Submitted:</strong> {format(new Date(selectedSubmission.submittedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Student's Answer</h4>
              <div className="bg-white dark:bg-dark-900 p-3 rounded border border-gray-200 dark:border-dark-700 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                  {selectedSubmission.answer}
                </pre>
              </div>
            </div>

            {selectedSubmission.status === 'pending' ? (
              <form onSubmit={handleGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Points (Max: {selectedChallenge.points})</label>
                    <input
                      type="number"
                      value={gradeData.pointsAwarded}
                      onChange={(e) => setGradeData({ ...gradeData, pointsAwarded: Math.min(selectedChallenge.points, parseInt(e.target.value) || 0) })}
                      className="input-field"
                      min="0"
                      max={selectedChallenge.points}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={gradeData.status}
                      onChange={(e) => setGradeData({ ...gradeData, status: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="correct">Correct</option>
                      <option value="partial">Partial</option>
                      <option value="incorrect">Incorrect</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={grading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {grading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Grading...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Submit Grade
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary flex-1"
                    disabled={grading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Grading Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Status:</strong> <span className="capitalize">{selectedSubmission.status}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Points Awarded:</strong> {selectedSubmission.pointsAwarded}
                  </p>
                  {selectedSubmission.feedback && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Feedback:</strong> {selectedSubmission.feedback}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Submissions;
