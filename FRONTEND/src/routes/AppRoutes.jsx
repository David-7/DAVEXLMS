import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

import Login from '../pages/auth/Login';
import ActivateAccount from '../pages/auth/ActivateAccount';
import PasswordReset from '../pages/auth/PasswordReset';

import StudentDashboard from '../pages/student/Dashboard';
import StudentCourses from '../pages/student/Courses';
import StudentChallenges from '../pages/student/Challenges';
import StudentLeaderboard from '../pages/student/Leaderboard';
import StudentAnnouncements from '../pages/student/Announcements';
import StudentProfile from '../pages/student/Profile';

import InstructorDashboard from '../pages/instructor/Dashboard';
import InstructorCourses from '../pages/instructor/Courses';
import InstructorStudents from '../pages/instructor/Students';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminStudents from '../pages/admin/Students';
import AdminInstructors from '../pages/admin/Instructors';
import AdminCourses from '../pages/admin/Courses';
import AdminChallenges from '../pages/admin/Challenges';
import AdminAnnouncements from '../pages/admin/Announcements';

import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'admin':
      case 'super_admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/password-reset" element={<PasswordReset />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/challenges"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentChallenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leaderboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/announcements"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/students"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorStudents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/instructors"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminInstructors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminChallenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminAnnouncements />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
