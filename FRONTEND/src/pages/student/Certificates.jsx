import { useState, useEffect } from 'react';
import { Download, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates/my-certificates');
      setCertificates(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    window.open(certificate.certificateUrl, '_blank');
    toast.success('Certificate download started');
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
        <h2 className="text-2xl font-bold text-white">My Certificates</h2>

        {certificates.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <Award className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-lg">No certificates yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Complete courses and challenges to earn certificates
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={32} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    certificate.certificateType === 'excellence'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : certificate.certificateType === 'achievement'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {certificate.certificateType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {certificate.title}
                </h3>

                {certificate.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {certificate.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {certificate.course && (
                    <p>
                      <strong>Course:</strong> {certificate.course.title}
                    </p>
                  )}
                  <p>
                    <strong>Issued:</strong> {format(new Date(certificate.issuedDate), 'MMM dd, yyyy')}
                  </p>
                  <p>
                    <strong>Issued by:</strong> {certificate.issuedBy?.fullName || 'Unknown'}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(certificate)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;
