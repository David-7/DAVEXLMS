import DashboardLayout from '../../layouts/DashboardLayout';

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">My Profile</h2>
        <p className="text-gray-600 dark:text-gray-400">Profile information will be displayed here</p>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
