import { useState, useEffect } from 'react';
import { Trophy, Calendar, Award, Target } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges');
      setChallenges(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (challengeId) => {
    toast.success('Participation feature coming soon!');
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

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Points</span>
                    <span className="font-semibold text-green-500">{challenge.points || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {challenge.difficulty || 'Medium'}
                    </span>
                  </div>
                  {challenge.deadline && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Due: {new Date(challenge.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleParticipate(challenge._id)}
                  className="w-full btn-primary"
                >
                  Participate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Challenges;
