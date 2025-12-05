import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import UniversityDashboard from '@/components/dashboard/UniversityDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Admin gets full dashboard with profile tab
  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'university') {
    return <UniversityDashboard />;
  }

  return <StudentDashboard />;
}
