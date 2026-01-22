import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Users, BookOpen, Globe, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const InstructorCourses = () => {
  const { user } = useAuth();
  const { courses, addCourse, togglePublishCourse, isLoading, error } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: user?.name || '',
    instructorId: user?.id || '',
    duration: '',
    level: 'Beginner' as const,
    category: '',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    price: 0,
    isFree: true,
    isPublished: false,
  });

  const instructorCourses = courses.filter(c => c.instructorId === user?.id);

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await addCourse({ ...newCourse, instructor: user?.name || '', instructorId: user?.id || '' });
      setNewCourse({
        title: '', description: '', instructor: user?.name || '', instructorId: user?.id || '',
        duration: '', level: 'Beginner', category: '',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        price: 0, isFree: true, isPublished: false,
      });
      setIsDialogOpen(false);
      // Success toast is handled in mutation onSuccess, but we can add one here if mutation one is removed or duplicate is fine.
      // actually mutation onSuccess handles it. I'll remove this double toast or keep it for immediate feedback if mutation doesn't throw.
    } catch (error) {
      console.error("Failed to create course:", error);
      // Mutation onError handles toast
    }
  };

  const handleTogglePublish = (courseId: string, currentStatus: boolean) => {
    togglePublishCourse(courseId, !currentStatus);
    toast.success(currentStatus ? 'Course unpublished' : 'Course published!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">Create and manage your courses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="h-4 w-4" /> Create Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Set up your course details. You can add modules and lessons after creation.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input id="title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="e.g., Complete Web Development Bootcamp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="What will students learn?" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="e.g., 8 weeks" />
                  </div>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} placeholder="e.g., Development" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value), isFree: Number(e.target.value) === 0 })} placeholder="0 for free" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive mb-2">Unable to load courses</h3>
            <p className="text-muted-foreground mb-4">Something went wrong while fetching courses.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {!isLoading && !error && instructorCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {instructorCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all">
                <div className="relative">
                  <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
                  <Badge className={`absolute top-3 right-3 ${course.isPublished ? 'bg-success' : 'bg-muted'}`}>
                    {course.isPublished ? <><Globe className="h-3 w-3 mr-1" />Published</> : <><EyeOff className="h-3 w-3 mr-1" />Draft</>}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.enrolledCount}</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.modules?.length || 0} modules</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch checked={course.isPublished} onCheckedChange={() => handleTogglePublish(course.id, course.isPublished)} />
                      <span className="text-sm">{course.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild><Link to={`/course/${course.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" asChild><Link to={`/instructor/course/${course.id}`}><Edit className="h-4 w-4" /></Link></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading && !error && (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">Create your first course and start teaching!</p>
            <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4" /> Create Your First Course</Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default InstructorCourses;
