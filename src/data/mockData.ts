export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  enrolledCount: number;
  rating: number;
  modules: Module[];
  price: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  contentType: 'video' | 'article' | 'quiz';
  order: number;
  completed?: boolean;
}

export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'truefalse';
  options: string[];
  correctAnswer: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
  answers: { questionId: string; selectedAnswer: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'instructor';
  avatar: string;
  bio?: string;
  joinedAt: string;
}

export interface Enrollment {
  courseId: string;
  userId: string;
  lessonProgress: Record<string, boolean>;
  enrolledAt: string;
  completedAt?: string;
  certificateId?: string;
  progress: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
}

// Mock Modules and Lessons for courses
const createMockModules = (count: number, courseId: string): Module[] => {
  const moduleNames = [
    'Introduction and Setup',
    'Core Fundamentals',
    'Intermediate Concepts',
    'Advanced Techniques',
    'Real-World Projects',
    'Best Practices',
    'Performance Optimization',
    'Testing Strategies',
    'Deployment Guide',
    'Final Assessment',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${courseId}-mod-${i + 1}`,
    title: moduleNames[i] || `Module ${i + 1}`,
    description: `Learn the ${moduleNames[i]?.toLowerCase() || 'essentials'} in this comprehensive module.`,
    order: i + 1,
    lessons: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, j) => ({
      id: `${courseId}-mod-${i + 1}-les-${j + 1}`,
      title: `Lesson ${j + 1}: ${['Overview', 'Deep Dive', 'Practical Exercise', 'Case Study', 'Summary'][j] || 'Topic'}`,
      duration: `${Math.floor(Math.random() * 20) + 10} min`,
      contentType: j === 2 ? 'quiz' as const : (Math.random() > 0.3 ? 'video' as const : 'article' as const),
      order: j + 1,
    })),
  }));
};

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch. Perfect for absolute beginners.',
    instructor: 'Sarah Johnson',
    instructorId: 'instructor1',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
    enrolledCount: 1234,
    rating: 4.8,
    modules: createMockModules(12, '1'),
    price: 0,
    isFree: true,
    isPublished: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts including hooks, context, performance optimization, and architectural patterns.',
    instructor: 'Michael Chen',
    instructorId: 'instructor2',
    duration: '6 weeks',
    level: 'Advanced',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    enrolledCount: 856,
    rating: 4.9,
    modules: createMockModules(10, '2'),
    price: 99,
    isFree: false,
    isPublished: true,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Discover the principles of user-centered design and create beautiful, intuitive interfaces that users love.',
    instructor: 'Sarah Johnson',
    instructorId: 'instructor1',
    duration: '10 weeks',
    level: 'Beginner',
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    enrolledCount: 2156,
    rating: 4.7,
    modules: createMockModules(15, '3'),
    price: 0,
    isFree: true,
    isPublished: true,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    title: 'Data Science with Python',
    description: 'Explore data analysis, visualization, and machine learning using Python and popular libraries like Pandas and Scikit-learn.',
    instructor: 'David Park',
    instructorId: 'instructor3',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    enrolledCount: 1567,
    rating: 4.6,
    modules: createMockModules(18, '4'),
    price: 149,
    isFree: false,
    isPublished: true,
    createdAt: '2024-02-15',
  },
  {
    id: '5',
    title: 'Digital Marketing Mastery',
    description: 'Learn SEO, social media marketing, content strategy, and analytics to grow any business online.',
    instructor: 'Lisa Thompson',
    instructorId: 'instructor4',
    duration: '8 weeks',
    level: 'Intermediate',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    enrolledCount: 923,
    rating: 4.5,
    modules: createMockModules(14, '5'),
    price: 79,
    isFree: false,
    isPublished: true,
    createdAt: '2024-03-01',
  },
  {
    id: '6',
    title: 'Cloud Architecture Essentials',
    description: 'Master AWS, Azure, and cloud infrastructure design patterns for scalable, resilient applications.',
    instructor: 'Michael Chen',
    instructorId: 'instructor2',
    duration: '10 weeks',
    level: 'Advanced',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    enrolledCount: 678,
    rating: 4.8,
    modules: createMockModules(16, '6'),
    price: 199,
    isFree: false,
    isPublished: true,
    createdAt: '2024-03-15',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Alex Turner',
    email: 'alex@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    joinedAt: '2024-01-01',
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    joinedAt: '2023-06-01',
  },
  {
    id: 'instructor1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    bio: 'Full-stack developer with 10+ years of experience. Passionate about teaching and helping others learn to code.',
    joinedAt: '2023-08-01',
  },
  {
    id: 'instructor2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    bio: 'Cloud architect and React specialist. Previously at Google and AWS.',
    joinedAt: '2023-09-01',
  },
  {
    id: 'instructor3',
    name: 'David Park',
    email: 'david@example.com',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    bio: 'Data scientist with expertise in Python, ML, and AI. PhD from MIT.',
    joinedAt: '2023-10-01',
  },
  {
    id: 'instructor4',
    name: 'Lisa Thompson',
    email: 'lisa@example.com',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    bio: 'Digital marketing expert with experience at Fortune 500 companies.',
    joinedAt: '2023-11-01',
  },
];

export const mockEnrollments: Enrollment[] = [
  { 
    courseId: '1', 
    userId: 'user1',
    progress: 75, 
    lessonProgress: { '1-mod-1-les-1': true, '1-mod-1-les-2': true, '1-mod-2-les-1': true },
    enrolledAt: '2024-01-15' 
  },
  { 
    courseId: '3', 
    userId: 'user1',
    progress: 100, 
    lessonProgress: {},
    enrolledAt: '2024-02-01',
    completedAt: '2024-03-15',
    certificateId: 'cert-1'
  },
  { 
    courseId: '4', 
    userId: 'user1',
    progress: 10, 
    lessonProgress: { '4-mod-1-les-1': true },
    enrolledAt: '2024-02-10' 
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    lessonId: '1-mod-1-les-3',
    courseId: '1',
    title: 'HTML Basics Quiz',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: 'What does HTML stand for?',
        type: 'mcq',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctAnswer: 0,
      },
      {
        id: 'q2',
        text: 'Which HTML tag is used for the largest heading?',
        type: 'mcq',
        options: ['<heading>', '<h6>', '<h1>', '<head>'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        text: 'HTML is a programming language.',
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        text: 'Which attribute is used to provide an alternate text for an image?',
        type: 'mcq',
        options: ['title', 'src', 'alt', 'href'],
        correctAnswer: 2,
      },
      {
        id: 'q5',
        text: 'The <br> tag requires a closing tag.',
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'quiz-2',
    lessonId: '2-mod-1-les-3',
    courseId: '2',
    title: 'React Hooks Quiz',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: 'Which hook is used for side effects in React?',
        type: 'mcq',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        text: 'useState can only hold primitive values.',
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        text: 'What is the purpose of useMemo?',
        type: 'mcq',
        options: [
          'To create state',
          'To memoize expensive calculations',
          'To handle side effects',
          'To create refs'
        ],
        correctAnswer: 1,
      },
    ],
  },
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user1',
    score: 80,
    passed: true,
    attemptedAt: '2024-02-15',
    answers: [
      { questionId: 'q1', selectedAnswer: 0 },
      { questionId: 'q2', selectedAnswer: 2 },
      { questionId: 'q3', selectedAnswer: 1 },
      { questionId: 'q4', selectedAnswer: 2 },
      { questionId: 'q5', selectedAnswer: 0 },
    ],
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'user1',
    courseId: '3',
    studentName: 'Alex Turner',
    courseName: 'UI/UX Design Fundamentals',
    instructorName: 'Sarah Johnson',
    issueDate: '2024-03-15',
  },
];
