import { Link } from 'react-router-dom';
import { useCourses, Course } from '@/contexts/CourseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Star, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

const CourseCard = ({ course, showProgress = false }: CourseCardProps) => {
  const { isEnrolled, getEnrollment, enrollInCourse } = useCourses();
  const enrolled = isEnrolled(course.id);
  const enrollment = getEnrollment(course.id);

  const levelColors: Record<string, string> = {
    BEGINNER: 'bg-success/10 text-success border-success/20',
    INTERMEDIATE: 'bg-accent/10 text-accent border-accent/20',
    ADVANCED: 'bg-primary/10 text-primary border-primary/20',
    // Fallback for case variations if frontend mocks still use capitalized
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-accent/10 text-accent border-accent/20',
    Advanced: 'bg-primary/10 text-primary border-primary/20',
  };

  const moduleCount = course.modules?.length || 0;

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant="outline" className={`absolute top-3 left-3 ${levelColors[course.level]}`}>
          {course.level}
        </Badge>
        {enrolled && (
          <Badge className="absolute top-3 right-3 bg-success text-success-foreground">Enrolled</Badge>
        )}
      </div>

      <CardContent className="p-5">
        <p className="text-xs font-medium text-primary mb-2">{course.category}</p>
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {moduleCount} modules
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {course.rating}
          </span>
        </div>

        {showProgress && enrolled && enrollment && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1" size="sm">
          <Link to={`/course/${course.id}`}>View Details</Link>
        </Button>
        {!enrolled && (
          <Button variant="default" size="sm" className="flex-1" onClick={() => enrollInCourse(course.id)}>
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
