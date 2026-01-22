import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, GraduationCap, Award, TrendingUp, BarChart3 } from 'lucide-react';

const AdminAnalytics = () => {
  const { courses, allEnrollments: enrollments, certificates, profiles, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded mx-auto"></div>
            <div className="h-4 w-96 bg-muted rounded mx-auto"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const students = profiles.filter(p => p.role?.toUpperCase() === 'STUDENT');
  const instructors = profiles.filter(p => p.role?.toUpperCase() === 'INSTRUCTOR');

  const totalStudents = students.length;
  const totalInstructors = instructors.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const draftCourses = courses.filter(c => !c.isPublished).length;
  const totalEnrollments = enrollments.length;
  const totalCertificates = certificates.length;

  // Course completion rate
  const completedEnrollments = enrollments.filter(e => e.progress === 100).length;
  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  // Popular courses (by enrollment count)
  const popularCourses = [...courses]
    .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
    .slice(0, 5);

  // Instructor performance
  const instructorStats = instructors
    .map(instructor => {
      const instructorCourses = courses.filter(c => c.instructorId === instructor.id);
      const totalStudents = instructorCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
      const avgRating = instructorCourses.length > 0
        ? (instructorCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / instructorCourses.length).toFixed(1)
        : '0';
      return {
        ...instructor,
        coursesCount: instructorCourses.length,
        totalStudents,
        avgRating,
      };
    })
    .sort((a, b) => b.totalStudents - a.totalStudents);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of platform performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-8">
          <StatCard title="Total Students" value={totalStudents} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Instructors" value={totalInstructors} icon={<GraduationCap className="h-5 w-5" />} />
          <StatCard title="Published Courses" value={publishedCourses} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard title="Draft Courses" value={draftCourses} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard title="Total Enrollments" value={totalEnrollments} icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard title="Certificates Issued" value={totalCertificates} icon={<Award className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Completion Rate */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Course Completion Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Completion Rate</span>
                    <span className="text-sm font-bold text-primary">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalEnrollments}</p>
                    <p className="text-xs text-muted-foreground">Total Enrollments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{completedEnrollments}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{totalEnrollments - completedEnrollments}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Courses */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Most Popular Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularCourses.map((course, i) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    <img src={course.thumbnail} alt={course.title} className="h-10 w-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.instructorId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{course.enrolledCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Instructor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Total Students</TableHead>
                  <TableHead className="text-center">Avg. Rating</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructorStats.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={instructor.avatar} alt={instructor.name} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="font-medium">{instructor.name}</p>
                          <p className="text-xs text-muted-foreground">{instructor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{instructor.coursesCount}</TableCell>
                    <TableCell className="text-center font-medium">{instructor.totalStudents.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        ⭐ {instructor.avgRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAnalytics;
