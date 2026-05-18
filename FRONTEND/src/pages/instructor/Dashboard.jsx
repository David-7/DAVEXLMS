import DashboardLayout from '../../layouts/DashboardLayout';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Instructor dashboard content</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
