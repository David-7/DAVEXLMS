import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
    
    const interval = setInterval(() => {
      fetchSchedules(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async (silent = false) => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data?.data || []);
      if (!silent) setLoading(false);
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch schedules');
        setLoading(false);
      }
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
        <h2 className="text-2xl font-bold text-green-600 dark:text-white">My Schedule</h2>

        {schedules.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {schedule.title || schedule.topic}
                    </h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {schedule.description}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>
                      {schedule.day || (schedule.date && format(new Date(schedule.date), 'EEEE, MMM dd, yyyy'))}
                    </span>
                  </div>

                  {(schedule.startTime || schedule.time) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={16} />
                      <span>
                        {schedule.startTime && schedule.endTime
                          ? `${schedule.startTime} - ${schedule.endTime}`
                          : schedule.time}
                      </span>
                    </div>
                  )}

                  {schedule.venue && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={16} />
                      <span>{schedule.venue}</span>
                    </div>
                  )}
                </div>

                {schedule.requiredMaterials && schedule.requiredMaterials.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Required Materials:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {schedule.requiredMaterials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
