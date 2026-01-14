import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Course, Enrollment, Module, Lesson, Quiz, QuizAttempt, Certificate,
  mockCourses, mockEnrollments, mockQuizzes, mockQuizAttempts, mockCertificates 
} from '@/data/mockData';

interface CourseContextType {
  courses: Course[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  
  addCourse: (course: Omit<Course, 'id' | 'modules' | 'enrolledCount' | 'rating' | 'createdAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  togglePublishCourse: (id: string) => void;
  getCourse: (courseId: string) => Course | undefined;
  getInstructorCourses: (instructorId: string) => Course[];
  
  addModule: (courseId: string, module: Omit<Module, 'id' | 'order' | 'lessons'>) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void;
  removeModule: (courseId: string, moduleId: string) => void;
  
  addLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'order'>) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  removeLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  
  enrollInCourse: (courseId: string, userId?: string) => void;
  unenrollFromCourse: (courseId: string, userId?: string) => void;
  isEnrolled: (courseId: string, userId?: string) => boolean;
  getEnrollment: (courseId: string, userId?: string) => Enrollment | undefined;
  updateLessonProgress: (courseId: string, lessonId: string, userId: string, completed: boolean) => void;
  getCourseEnrollments: (courseId: string) => Enrollment[];
  
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Quiz;
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => void;
  getQuiz: (lessonId: string) => Quiz | undefined;
  getQuizById: (quizId: string) => Quiz | undefined;
  
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'score' | 'passed' | 'attemptedAt'>) => QuizAttempt;
  getQuizAttempts: (quizId: string, userId: string) => QuizAttempt[];
  getBestAttempt: (quizId: string, userId: string) => QuizAttempt | undefined;
  
  generateCertificate: (courseId: string, userId: string, studentName: string) => Certificate;
  getCertificate: (certificateId: string) => Certificate | undefined;
  getUserCertificates: (userId: string) => Certificate[];
  
  isCourseCompleted: (courseId: string, userId: string) => boolean;
  getCourseCompletionStatus: (courseId: string, userId: string) => {
    lessonsCompleted: number;
    totalLessons: number;
    quizzesPassed: boolean;
    isCompleted: boolean;
  };
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);

  const addCourse = (courseData: Omit<Course, 'id' | 'modules' | 'enrolledCount' | 'rating' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString(),
      modules: [],
      enrolledCount: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setEnrollments(prev => prev.filter(e => e.courseId !== id));
  };

  const togglePublishCourse = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isPublished: !c.isPublished } : c));
  };

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getInstructorCourses = (instructorId: string) => courses.filter(c => c.instructorId === instructorId);

  const addModule = (courseId: string, moduleData: Omit<Module, 'id' | 'order' | 'lessons'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const newModule: Module = {
        ...moduleData,
        id: `${courseId}-mod-${Date.now()}`,
        order: course.modules.length + 1,
        lessons: [],
      };
      return { ...course, modules: [...course.modules, newModule] };
    }));
  };

  const updateModule = (courseId: string, moduleId: string, updates: Partial<Module>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return { ...course, modules: course.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m) };
    }));
  };

  const removeModule = (courseId: string, moduleId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return { ...course, modules: course.modules.filter(m => m.id !== moduleId).map((m, i) => ({ ...m, order: i + 1 })) };
    }));
  };

  const addLesson = (courseId: string, moduleId: string, lessonData: Omit<Lesson, 'id' | 'order'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        modules: course.modules.map(module => {
          if (module.id !== moduleId) return module;
          const newLesson: Lesson = { ...lessonData, id: `${moduleId}-les-${Date.now()}`, order: module.lessons.length + 1 };
          return { ...module, lessons: [...module.lessons, newLesson] };
        }),
      };
    }));
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        modules: course.modules.map(module => {
          if (module.id !== moduleId) return module;
          return { ...module, lessons: module.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) };
        }),
      };
    }));
  };

  const removeLesson = (courseId: string, moduleId: string, lessonId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        modules: course.modules.map(module => {
          if (module.id !== moduleId) return module;
          return { ...module, lessons: module.lessons.filter(l => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 })) };
        }),
      };
    }));
  };

  const enrollInCourse = (courseId: string, userId: string = 'user1') => {
    if (!enrollments.find(e => e.courseId === courseId && e.userId === userId)) {
      setEnrollments(prev => [...prev, { courseId, userId, progress: 0, lessonProgress: {}, enrolledAt: new Date().toISOString().split('T')[0] }]);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c));
    }
  };

  const unenrollFromCourse = (courseId: string, userId: string = 'user1') => {
    setEnrollments(prev => prev.filter(e => !(e.courseId === courseId && e.userId === userId)));
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolledCount: Math.max(0, c.enrolledCount - 1) } : c));
  };

  const isEnrolled = (courseId: string, userId: string = 'user1') => enrollments.some(e => e.courseId === courseId && e.userId === userId);
  const getEnrollment = (courseId: string, userId: string = 'user1') => enrollments.find(e => e.courseId === courseId && e.userId === userId);

  const updateLessonProgress = (courseId: string, lessonId: string, userId: string, completed: boolean) => {
    setEnrollments(prev => prev.map(e => {
      if (e.courseId !== courseId || e.userId !== userId) return e;
      const newProgress = { ...e.lessonProgress, [lessonId]: completed };
      const course = courses.find(c => c.id === courseId);
      if (!course) return e;
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = Object.values(newProgress).filter(Boolean).length;
      const progress = Math.round((completedLessons / totalLessons) * 100);
      return { ...e, lessonProgress: newProgress, progress };
    }));
  };

  const getCourseEnrollments = (courseId: string) => enrollments.filter(e => e.courseId === courseId);

  const addQuiz = (quizData: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = { ...quizData, id: `quiz-${Date.now()}` };
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  const updateQuiz = (quizId: string, updates: Partial<Quiz>) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, ...updates } : q));
  };

  const getQuiz = (lessonId: string) => quizzes.find(q => q.lessonId === lessonId);
  const getQuizById = (quizId: string) => quizzes.find(q => q.id === quizId);

  const submitQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'score' | 'passed' | 'attemptedAt'>) => {
    const quiz = quizzes.find(q => q.id === attemptData.quizId);
    if (!quiz) throw new Error('Quiz not found');
    const correctAnswers = attemptData.answers.filter(a => {
      const question = quiz.questions.find(q => q.id === a.questionId);
      return question && question.correctAnswer === a.selectedAnswer;
    }).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const newAttempt: QuizAttempt = { ...attemptData, id: `attempt-${Date.now()}`, score, passed, attemptedAt: new Date().toISOString().split('T')[0] };
    setQuizAttempts(prev => [...prev, newAttempt]);
    return newAttempt;
  };

  const getQuizAttempts = (quizId: string, userId: string) => quizAttempts.filter(a => a.quizId === quizId && a.userId === userId);
  const getBestAttempt = (quizId: string, userId: string) => {
    const attempts = getQuizAttempts(quizId, userId);
    return attempts.reduce<QuizAttempt | undefined>((best, current) => !best || current.score > best.score ? current : best, undefined);
  };

  const generateCertificate = (courseId: string, userId: string, studentName: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const newCert: Certificate = { id: `cert-${Date.now()}`, userId, courseId, studentName, courseName: course.title, instructorName: course.instructor, issueDate: new Date().toISOString().split('T')[0] };
    setCertificates(prev => [...prev, newCert]);
    setEnrollments(prev => prev.map(e => e.courseId === courseId && e.userId === userId ? { ...e, certificateId: newCert.id, completedAt: newCert.issueDate } : e));
    return newCert;
  };

  const getCertificate = (certificateId: string) => certificates.find(c => c.id === certificateId);
  const getUserCertificates = (userId: string) => certificates.filter(c => c.userId === userId);

  const isCourseCompleted = (courseId: string, userId: string) => getCourseCompletionStatus(courseId, userId).isCompleted;

  const getCourseCompletionStatus = (courseId: string, userId: string) => {
    const course = courses.find(c => c.id === courseId);
    const enrollment = enrollments.find(e => e.courseId === courseId && e.userId === userId);
    if (!course || !enrollment) return { lessonsCompleted: 0, totalLessons: 0, quizzesPassed: false, isCompleted: false };
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const lessonsCompleted = Object.values(enrollment.lessonProgress).filter(Boolean).length;
    const courseQuizzes = quizzes.filter(q => q.courseId === courseId);
    const quizzesPassed = courseQuizzes.every(quiz => getBestAttempt(quiz.id, userId)?.passed) || courseQuizzes.length === 0;
    const isCompleted = lessonsCompleted >= totalLessons && quizzesPassed;
    return { lessonsCompleted, totalLessons, quizzesPassed, isCompleted };
  };

  return (
    <CourseContext.Provider value={{
      courses, enrollments, quizzes, quizAttempts, certificates,
      addCourse, updateCourse, removeCourse, togglePublishCourse, getCourse, getInstructorCourses,
      addModule, updateModule, removeModule, addLesson, updateLesson, removeLesson,
      enrollInCourse, unenrollFromCourse, isEnrolled, getEnrollment, updateLessonProgress, getCourseEnrollments,
      addQuiz, updateQuiz, getQuiz, getQuizById, submitQuizAttempt, getQuizAttempts, getBestAttempt,
      generateCertificate, getCertificate, getUserCertificates, isCourseCompleted, getCourseCompletionStatus,
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourses must be used within a CourseProvider');
  return context;
};
