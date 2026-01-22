import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const LessonView = () => {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const navigate = useNavigate();
    const { getCourse, getEnrollment, completeLesson } = useCourses();
    const { user } = useAuth();

    const course = getCourse(courseId || '');
    const enrollment = getEnrollment(courseId || '');

    // Find current lesson and its neighbors
    const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
    const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
    const lesson = allLessons[currentLessonIndex];
    const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

    const isCompleted = enrollment?.completedLessons?.includes(lessonId || '');

    if (!course || !lesson) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
                <Button asChild><Link to={`/course/${courseId}`}>Back to Course</Link></Button>
            </div>
        );
    }

    const handleComplete = async () => {
        await completeLesson(course.id, lesson.id);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar - Lesson List */}
                <aside className="w-full lg:w-80 border-r bg-muted/30 overflow-y-auto hidden lg:block">
                    <div className="p-4 border-b">
                        <Link to={`/course/${course.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Course
                        </Link>
                        <h2 className="mt-4 font-display font-bold truncate">{course.title}</h2>
                        <div className="mt-2 text-xs flex justify-between mb-1">
                            <span>Your Progress</span>
                            <span>{enrollment?.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment?.progress || 0} className="h-1.5" />
                    </div>

                    <div className="p-2 space-y-4">
                        {course.modules?.map((module, i) => (
                            <div key={module.id}>
                                <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Module {i + 1}: {module.title}
                                </h3>
                                <div className="mt-1 space-y-0.5">
                                    {module.lessons.map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => navigate(`/course/${course.id}/lesson/${l.id}`)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${l.id === lesson.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                                }`}
                                        >
                                            {enrollment?.completedLessons?.includes(l.id) ? (
                                                <CheckCircle2 className={`h-4 w-4 ${l.id === lesson.id ? 'text-primary-foreground' : 'text-success'}`} />
                                            ) : (
                                                l.type === 'video' ? <Play className="h-4 w-4" /> : <FileText className="h-4 w-4" />
                                            )}
                                            <span className="truncate">{l.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-card">
                    <div className="max-w-4xl mx-auto p-4 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <Badge variant="outline" className="mb-2">{lesson.type.toUpperCase()}</Badge>
                                <h1 className="text-3xl font-display font-bold">{lesson.title}</h1>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={isCompleted ? "outline" : "default"}
                                    onClick={handleComplete}
                                    disabled={isCompleted}
                                >
                                    <CheckCircle2 className={`h-4 w-4 mr-2 ${isCompleted ? 'text-success' : ''}`} />
                                    {isCompleted ? 'Completed' : 'Mark as Completed'}
                                </Button>
                            </div>
                        </div>

                        {/* Video Player Placeholder / Embed */}
                        {lesson.type === 'video' && (
                            <div className="aspect-video bg-black rounded-lg mb-8 flex items-center justify-center text-white overflow-hidden shadow-xl">
                                {lesson.videoUrl ? (
                                    <iframe
                                        src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">Video content would appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Lesson Content */}
                        <div className="prose prose-slate max-w-none dark:prose-invert mb-12">
                            {lesson.content ? (
                                <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
                            ) : (
                                <p className="text-muted-foreground italic">No additional content provided for this lesson.</p>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-8 border-t">
                            <Button
                                variant="ghost"
                                disabled={!prevLesson}
                                onClick={() => navigate(`/course/${course.id}/lesson/${prevLesson.id}`)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>

                            <div className="flex-1 text-center font-medium">
                                Lesson {currentLessonIndex + 1} of {allLessons.length}
                            </div>

                            {nextLesson ? (
                                <Button
                                    onClick={() => navigate(`/course/${course.id}/lesson/${nextLesson.id}`)}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link to={`/course/${course.id}`}>Back to Overview</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LessonView;
