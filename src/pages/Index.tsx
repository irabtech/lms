import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (hasRole('ADMIN')) {
        navigate('/admin');
      } else if (hasRole('INSTRUCTOR')) {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [user, hasRole, isLoading, navigate]);

  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
};

export default Index;
