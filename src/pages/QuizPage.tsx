import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const QuizPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourse, getQuiz, submitQuizAttempt, getBestAttempt, generateCertificate, getCourseCompletionStatus, updateLessonProgress } = useCourses();

  const course = getCourse(courseId || '');
  const quiz = getQuiz(lessonId || '');
  const bestAttempt = quiz ? getBestAttempt(quiz.id, user?.id || 'user1') : undefined;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!course || !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
          <Button asChild><Link to={`/course/${courseId}`}>Back to Course</Link></Button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.id]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const attemptAnswers = quiz.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? -1,
    }));

    const attemptResult = submitQuizAttempt({
      quizId: quiz.id,
      userId: user?.id || 'user1',
      answers: attemptAnswers,
    });

    setResult({ score: attemptResult.score, passed: attemptResult.passed });
    setSubmitted(true);

    if (attemptResult.passed) {
      updateLessonProgress(courseId || '', lessonId || '', user?.id || 'user1', true);
      toast.success('Congratulations! You passed the quiz!');

      // Check if course is now completed
      const status = getCourseCompletionStatus(courseId || '');
      if (status.isCompleted) {
        generateCertificate(courseId || '');
        toast.success('🎉 Course completed! Certificate generated!');
      }
    } else {
      toast.error('You did not pass. Try again!');
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 max-w-2xl">
          <Card className="shadow-card animate-fade-in">
            <CardContent className="p-8 text-center">
              {result.passed ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h1 className="text-3xl font-display font-bold mb-2">Congratulations!</h1>
                  <p className="text-muted-foreground mb-6">You passed the quiz with a score of {result.score}%</p>
                  <Badge className="bg-success text-success-foreground mb-8">Passed</Badge>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h1 className="text-3xl font-display font-bold mb-2">Keep Practicing!</h1>
                  <p className="text-muted-foreground mb-6">You scored {result.score}%. You need {quiz.passingScore}% to pass.</p>
                  <Badge variant="destructive" className="mb-8">Not Passed</Badge>
                </>
              )}

              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link to={`/course/${courseId}`}><ArrowLeft className="h-4 w-4" /> Back to Course</Link>
                </Button>
                {!result.passed && (
                  <Button onClick={handleRetry}><RotateCcw className="h-4 w-4" /> Try Again</Button>
                )}
                {result.passed && (
                  <Button asChild>
                    <Link to={`/course/${courseId}`}><Award className="h-4 w-4" /> Continue Learning</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-3xl">
        <Link to={`/course/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>

        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{course.title}</Badge>
              {bestAttempt && <Badge variant="secondary">Best Score: {bestAttempt.score}%</Badge>}
            </div>
            <CardTitle className="font-display text-2xl">{quiz.title}</CardTitle>
            <CardDescription>Question {currentQuestion + 1} of {quiz.questions.length} • Passing Score: {quiz.passingScore}%</CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">{question.text}</h3>
              <RadioGroup value={answers[question.id]?.toString()} onValueChange={handleAnswer}>
                {question.options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>Previous</Button>
              <div className="flex gap-2">
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>Submit Quiz</Button>
                ) : (
                  <Button onClick={handleNext} disabled={answers[question.id] === undefined}>Next</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;
