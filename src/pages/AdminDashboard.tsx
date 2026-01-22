import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, DollarSign, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { courses, addCourse, removeCourse } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    instructorId: 'admin1',
    duration: '',
    level: 'Beginner' as const,
    category: '',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    price: 0,
    isFree: true,
    isPublished: true,
  });

  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const avgRating = courses.length ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1) : 0;

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    addCourse(newCourse);
    setNewCourse({ title: '', description: '', instructor: '', instructorId: 'admin1', duration: '', level: 'Beginner', category: '', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop', price: 0, isFree: true, isPublished: true });
    setIsDialogOpen(false);
    toast.success('Course added successfully!');
  };

  const handleRemoveCourse = (id: string, title: string) => {
    removeCourse(id);
    toast.success(`"${title}" has been removed`);
  };

  const levelColors = { Beginner: 'bg-success/10 text-success', Intermediate: 'bg-accent/10 text-accent', Advanced: 'bg-primary/10 text-primary' };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage courses and monitor platform performance.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button size="lg"><Plus className="h-4 w-4" />Add Course</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>Create a new course for the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input id="title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="e.g., Introduction to Python" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Brief course description..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input id="instructor" value={newCourse.instructor} onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })} placeholder="Instructor name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="e.g., 8 weeks" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={newCourse.level} onValueChange={(v) => setNewCourse({ ...newCourse, level: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} placeholder="e.g., Development" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCourse}>Add Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Courses" value={courses.length} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard title="Total Enrollments" value={totalEnrollments.toLocaleString()} icon={<Users className="h-5 w-5" />} trend={{ value: 12, positive: true }} />
          <StatCard title="Average Rating" value={avgRating} icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard title="Revenue" value="$24.5k" icon={<DollarSign className="h-5 w-5" />} description="This month" trend={{ value: 8, positive: true }} />
        </div>

        <Card className="shadow-card animate-fade-in">
          <CardHeader><CardTitle className="font-display">All Courses</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Enrolled</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={course.thumbnail} alt={course.title} className="h-10 w-16 rounded-md object-cover" />
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <p className="text-xs text-muted-foreground">{course.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{course.instructor}</TableCell>
                      <TableCell><Badge variant="secondary" className={levelColors[course.level]}>{course.level}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{course.enrolledCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right"><span className="text-accent font-medium">{course.rating}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveCourse(course.id, course.title)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
