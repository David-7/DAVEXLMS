import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/DataTable';
import api from '../../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/instructor/students');
      setStudents(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Admission No',
      accessor: 'admissionNumber',
      render: (row) => row.admissionNumber || 'N/A',
    },
    {
      header: 'Name',
      accessor: 'fullName',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Course',
      accessor: 'assignedCourse',
      render: (row) => row.assignedCourse?.title || 'Not Assigned',
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.plan === 'premium' 
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {row.plan}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : row.status === 'blocked'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

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
        <h2 className="text-2xl font-bold text-white">My Students</h2>

        <div className="card">
          {students.length === 0 ? (
            <p className="text-gray-500">No students assigned yet</p>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              searchPlaceholder="Search students..."
              actions={false}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
