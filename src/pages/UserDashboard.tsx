import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import CourseCard from '@/components/courses/CourseCard';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { courses, enrollments, isLoading, error } = useCourses();

  const enrolledCourses = courses.filter(course =>
    enrollments.some(e => e.courseId === course.id)
  );

  const totalProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  const completedCourses = enrollments.filter(e => e.progress === 100).length;

  const suggestedCourses = courses
    .filter(course => !enrollments.some(e => e.courseId === course.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Enrolled Courses"
            value={enrolledCourses.length}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="Average Progress"
            value={`${totalProgress}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Completed"
            value={completedCourses}
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatCard
            title="Learning Hours"
            value="24h"
            icon={<Clock className="h-5 w-5" />}
            description="This month"
          />
        </div>

        {/* Enrolled Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">My Courses</h2>
            <Button variant="ghost" asChild>
              <Link to="/courses">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/20">
              <p className="text-muted-foreground mb-2">Unable to load your enrollments.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {!isLoading && !error && enrolledCourses.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(course => (
                <CourseCard key={course.id} course={course} showProgress />
              ))}
            </div>
          )}

          {!isLoading && !error && enrolledCourses.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course.
              </p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Suggested Courses */}
        {suggestedCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
                <p className="text-muted-foreground text-sm">
                  Based on your learning preferences
                </p>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/courses">
                  Explore All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
