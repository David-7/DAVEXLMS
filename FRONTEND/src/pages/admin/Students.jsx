import DashboardLayout from '../../layouts/DashboardLayout';

const Students = () => {
  return (
    <DashboardLayout>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Manage Students</h2>
        <p className="text-gray-600 dark:text-gray-400">Student management content</p>
      </div>
    </DashboardLayout>
  );
};

export default Students;
