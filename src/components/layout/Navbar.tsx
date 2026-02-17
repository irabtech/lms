import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LayoutDashboard, LogOut, GraduationCap, Award, Users, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth(); // isAuthenticated optional if we use !!user
  // AuthContext doesn't export isAuthenticated anymore (it exports user, isLoading, etc.) 
  // Let's rely on !!user
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const getDashboardLink = () => {
    if (hasRole('ADMIN')) return '/admin';
    if (hasRole('INSTRUCTOR')) return '/instructor/dashboard';
    return '/dashboard';
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="gradient-primary rounded-lg p-2 transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            IRAB Tech Learning Hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to={getDashboardLink()}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(getDashboardLink()) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {hasRole('INSTRUCTOR') && (
            <Link
              to="/instructor/courses"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/instructor/courses') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <BookOpen className="h-4 w-4" />
              My Courses
            </Link>
          )}

          {hasRole('ADMIN') && (
            <>
              <Link
                to="/admin/analytics"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/admin/analytics') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/admin/users') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
            </>
          )}

          <Link
            to="/courses"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </Link>

          {hasRole('STUDENT') && (
            <Link
              to="/certificates"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/certificates') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Award className="h-4 w-4" />
              Certificates
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.roles?.join(', ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
