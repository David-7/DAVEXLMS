import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 px-4">
      <div className="text-center">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={64} />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to access this page
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
