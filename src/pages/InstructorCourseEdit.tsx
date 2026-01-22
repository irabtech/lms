import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Plus, Trash2, GripVertical, Play, FileText, HelpCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

const InstructorCourseEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getCourse, updateCourse, addModule, removeModule, addLesson, updateLesson, removeLesson } = useCourses();

  const course = getCourse(id || '');
  // Using course.enrolledCount instead of fetching list


  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({ title: '', duration: '', contentType: 'video' as 'video' | 'text' | 'quiz', content: '', videoUrl: '' });

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button asChild><Link to="/instructor/courses">Back to Courses</Link></Button>
        </div>
      </div>
    );
  }

  const handleAddModule = async () => {
    if (!newModule.title) { toast.error('Module title is required'); return; }
    try {
      await addModule(course.id, newModule);
      setNewModule({ title: '', description: '' });
      setIsModuleDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !selectedModuleId) { toast.error('Lesson title is required'); return; }
    try {
      if (editingLessonId) {
        await updateLesson(course.id, selectedModuleId, editingLessonId, newLesson);
      } else {
        await addLesson(course.id, selectedModuleId, newLesson);
      }
      setNewLesson({ title: '', duration: '', contentType: 'video', content: '', videoUrl: '' });
      setIsLessonDialogOpen(false);
      setEditingLessonId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const openLessonDialog = (moduleId: string, lesson?: any) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLessonId(lesson.id);
      setNewLesson({
        title: lesson.title,
        duration: lesson.duration,
        contentType: lesson.type,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || ''
      });
    } else {
      setEditingLessonId(null);
      setNewLesson({ title: '', duration: '', contentType: 'video', content: '', videoUrl: '' });
    }
    setIsLessonDialogOpen(true);
  };

  const contentTypeIcons = { video: Play, text: FileText, quiz: HelpCircle };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={course.title} onChange={(e) => updateCourse(course.id, { title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={course.description} onChange={(e) => updateCourse(course.id, { description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={course.duration} onChange={(e) => updateCourse(course.id, { duration: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={course.level} onValueChange={(v) => updateCourse(course.id, { level: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules & Lessons */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">Course Content</CardTitle>
                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Add Module</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Module</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Module Title</Label>
                        <Input value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} placeholder="e.g., Introduction" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} placeholder="Brief module description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddModule}>Add Module</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {course.modules && course.modules.length > 0 ? (
                  <Accordion type="multiple" className="space-y-2">
                    {course.modules.map((module, i) => (
                      <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">{i + 1}</span>
                            <span className="font-medium">{module.title}</span>
                            <Badge variant="secondary" className="ml-2">{module.lessons.length} lessons</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-10 space-y-2 mb-4">
                            {module.lessons.map((lesson) => {
                              const Icon = contentTypeIcons[lesson.type];
                              return (
                                <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => openLessonDialog(module.id, lesson)}>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{lesson.title}</span>
                                      <span className="text-xs text-muted-foreground">{lesson.duration} {lesson.videoUrl ? '• Video' : ''}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLessonDialog(module.id, lesson)}>
                                      <Plus className="h-3 w-3" /> {/* Use Plus as edit for now or just the click area */}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { removeLesson(course.id, module.id, lesson.id); toast.success('Lesson removed'); }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="pl-10 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openLessonDialog(module.id)}><Plus className="h-3 w-3" /> Add Lesson</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { removeModule(course.id, module.id); toast.success('Module removed'); }}>
                              <Trash2 className="h-3 w-3" /> Remove Module
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No modules yet. Add your first module to get started!</p>
                    <Button onClick={() => setIsModuleDialogOpen(true)}><Plus className="h-4 w-4" /> Add First Module</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="font-display text-lg">Enrolled Students</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="gradient-primary rounded-xl p-3 text-primary-foreground"><Users className="h-5 w-5" /></div>
                  <div>
                    <p className="text-2xl font-bold">{course.enrolledCount}</p>
                    <p className="text-sm text-muted-foreground">students enrolled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle className="font-display text-lg">Course Status</CardTitle></CardHeader>
              <CardContent>
                <Badge variant={course.isPublished ? 'default' : 'secondary'} className="mb-4">
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {course.isPublished ? 'Students can enroll in this course.' : 'This course is not visible to students yet.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingLessonId ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} placeholder="e.g., Getting Started" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} placeholder="e.g., 15 min" />
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={newLesson.contentType} onValueChange={(v) => setNewLesson({ ...newLesson, contentType: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text Article</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newLesson.contentType === 'video' && (
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input value={newLesson.videoUrl} onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })} placeholder="YouTube or Vimeo URL" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Content (Markdown supported)</Label>
                <Textarea
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  placeholder="The text content for this lesson..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsLessonDialogOpen(false); setEditingLessonId(null); }}>Cancel</Button>
              <Button onClick={handleAddLesson}>{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default InstructorCourseEdit;
