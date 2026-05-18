import DashboardLayout from '../../layouts/DashboardLayout';

const Announcements = () => {
  return (
    <DashboardLayout>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Announcements</h2>
        <p className="text-gray-600 dark:text-gray-400">Announcements will be displayed here</p>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
