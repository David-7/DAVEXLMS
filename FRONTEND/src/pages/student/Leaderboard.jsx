import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <span className="text-gray-500 font-bold">{rank}</span>;
  };

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
        <h2 className="text-2xl font-bold text-white">Monthly Leaderboard</h2>

        <div className="card">
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leaderboard data yet</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.student?._id === user?._id;

                return (
                  <div
                    key={entry._id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isCurrentUser
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                        : 'bg-gray-100 dark:bg-dark-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <p className={`font-semibold ${isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                          {entry.student?.fullName || 'Unknown'}
                          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.student?.admissionNumber || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {entry.monthlyPoints || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Login: {entry.loginPoints || 0} | Challenge: {entry.challengePoints || 0}
                      </p>
                      {entry.badges && entry.badges.length > 0 && (
                        <div className="flex gap-1 mt-1 justify-end">
                          {entry.badges.slice(0, 3).map((badge, i) => (
                            <Award key={i} className="text-yellow-500" size={16} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">How Points Work</h3>
          <div className="space-y-2 text-gray-400">
            <p>• <strong>Login Points:</strong> Earn 1 point per day when you log in</p>
            <p>• <strong>Challenge Points:</strong> Earn points by completing challenges</p>
            <p>• <strong>Monthly Reset:</strong> Points reset on the 1st of each month</p>
            <p>• <strong>Total Points:</strong> Your lifetime points are preserved</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
