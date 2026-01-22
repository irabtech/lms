import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/NotFound";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourses from "./pages/InstructorCourses";
import InstructorCourseEdit from "./pages/InstructorCourseEdit";
import QuizPage from "./pages/QuizPage";
import CertificatePage from "./pages/CertificatePage";
import CertificatesList from "./pages/CertificatesList";
import AdminAnalytics from "./pages/AdminAnalytics";
import LessonView from "./pages/LessonView";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['STUDENT']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requiredRoles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/instructor/dashboard" element={<ProtectedRoute requiredRoles={['INSTRUCTOR']}><InstructorDashboard /></ProtectedRoute>} />
      <Route path="/instructor/courses" element={<ProtectedRoute requiredRoles={['INSTRUCTOR']}><InstructorCourses /></ProtectedRoute>} />
      <Route path="/instructor/course/:id" element={<ProtectedRoute requiredRoles={['INSTRUCTOR']}><InstructorCourseEdit /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      <Route path="/course/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
      <Route path="/course/:courseId/quiz/:lessonId" element={<ProtectedRoute requiredRoles={['STUDENT']}><QuizPage /></ProtectedRoute>} />
      <Route path="/certificate/:id" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute requiredRoles={['STUDENT']}><CertificatesList /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CourseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CourseProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
