import DashboardLayout from '../../layouts/DashboardLayout';

const Students = () => {
  return (
    <DashboardLayout>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">My Students</h2>
        <p className="text-gray-600 dark:text-gray-400">Student list will be displayed here</p>
      </div>
    </DashboardLayout>
  );
};

export default Students;
