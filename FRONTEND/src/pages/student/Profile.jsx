import { useState } from 'react';
import { User, Mail, Calendar, Award, BookOpen, CreditCard } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>

        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{user?.role?.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admission Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.admissionNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.plan || 'Basic'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-orange-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.status || 'Active'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="text-indigo-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Since</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.enrollmentDate ? new Date(user.enrollmentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="text-yellow-500" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.accountNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
