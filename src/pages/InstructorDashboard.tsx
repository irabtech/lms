import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Plus, Eye, Edit, GraduationCap } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses, enrollments } = useCourses();

  const instructorCourses = courses.filter(c => c.instructorId === user?.id);
  const publishedCourses = instructorCourses.filter(c => c.isPublished);
  const totalStudents = instructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);

  const avgCompletion = instructorCourses.length > 0
    ? Math.round(
      enrollments
        .filter(e => instructorCourses.some(c => c.id === e.courseId))
        .reduce((sum, e) => sum + e.progress, 0) /
      Math.max(enrollments.filter(e => instructorCourses.some(c => c.id === e.courseId)).length, 1)
    )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Profile Card */}
        <Card className="mb-8 shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-display font-bold mb-1">{user?.name}</h1>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <p className="text-sm text-muted-foreground max-w-xl">{user?.bio}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <GraduationCap className="h-3 w-3 mr-1" /> Instructor
                  </Badge>
                  <Badge variant="outline">{instructorCourses.length} Courses Created</Badge>
                </div>
              </div>
              <Button asChild>
                <Link to="/instructor/courses">
                  <Plus className="h-4 w-4" /> Create Course
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Active Courses"
            value={publishedCourses.length}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Avg. Completion"
            value={`${avgCompletion}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Draft Courses"
            value={instructorCourses.length - publishedCourses.length}
            icon={<Edit className="h-5 w-5" />}
          />
        </div>

        {/* My Courses */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">My Courses</CardTitle>
            <Button variant="outline" asChild size="sm">
              <Link to="/instructor/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {instructorCourses.length > 0 ? (
              <div className="space-y-4">
                {instructorCourses.slice(0, 5).map((course) => {
                  const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
                  const avgProgress = courseEnrollments.length > 0
                    ? Math.round(courseEnrollments.reduce((s, e) => s + e.progress, 0) / courseEnrollments.length)
                    : 0;

                  return (
                    <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{course.title}</h3>
                          <Badge variant={course.isPublished ? 'default' : 'secondary'} className="shrink-0">
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{course.enrolledCount} students</span>
                          <span>{course.modules?.length || 0} modules</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Avg. Student Progress</span>
                            <span>{avgProgress}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/course/${course.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/instructor/course/${course.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first course!</p>
                <Button asChild>
                  <Link to="/instructor/courses"><Plus className="h-4 w-4" /> Create Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InstructorDashboard;
