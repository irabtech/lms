import React, { createContext, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// --- Types (Frontend - CamelCase) ---

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
    content: string;
    type: 'video' | 'text' | 'quiz';
    duration: string;
    videoUrl?: string; // mapped from video_url
    isFree: boolean; // mapped from is_free
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructorId: string; // mapped from instructor_id
    instructorName?: string; // Optional, might need to fetch separately or included in join
    level: string;
    category: string;
    price: number;
    thumbnail: string;
    duration: string;
    rating: number;
    enrolledCount: number; // mapped from enrolled_count
    isPublished: boolean; // mapped from is_published
    createdAt: string; // mapped from created_at
    updatedAt: string; // mapped from updated_at
    modules: Module[];
    isFree?: boolean;
}

export interface Enrollment {
    id: string;
    courseId: string; // mapped from course_id
    userId: string; // mapped from user_id
    progress: number;
    completedLessons: string[]; // mapped from completed_lessons
    enrolledAt: string;
}

export interface QuizAttempt {
    id: string;
    score: number;
    passed: boolean;
    date: string;
}

interface CourseContextType {
    courses: Course[];
    enrollments: Enrollment[];
    isLoading: boolean;
    error: any;

    // Reads
    getCourse: (id: string) => Course | undefined;
    isEnrolled: (courseId: string) => boolean;
    getEnrollment: (courseId: string) => Enrollment | undefined;
    getCourseEnrollment: (courseId: string) => Enrollment | undefined; // Alias for getEnrollment to satisfy inconsistent usage
    getCourseCompletionStatus: (courseId: string) => number;

    // Writes (Course Management)
    addCourse: (data: any) => Promise<void>;
    updateCourse: (id: string, data: any) => Promise<void>;
    removeCourse: (id: string) => Promise<void>;
    togglePublishCourse: (id: string, isPublished: boolean) => Promise<void>;

    // Writes (Content Management)
    addModule: (courseId: string, data: any) => Promise<void>;
    removeModule: (courseId: string, moduleId: string) => Promise<void>;
    addLesson: (courseId: string, moduleId: string, data: any) => Promise<void>;
    removeLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<void>;

    // Writes (Student Actions)
    enrollInCourse: (courseId: string) => Promise<void>;
    unenrollFromCourse: (courseId: string) => Promise<void>; // Stub
    updateLessonProgress: (enrollmentId: string, progress: number, completedLessons: string[]) => Promise<void>;

    // Quiz & Certificates (Stubs/Mock)
    getQuiz: (lessonId: string) => any;
    submitQuizAttempt: (lessonId: string, answers: any[]) => Promise<any>;
    getBestAttempt: (lessonId: string) => any;
    generateCertificate: (courseId: string) => Promise<string>;
    getCertificate: (courseId: string) => any;
    getUserCertificates: (userId?: string) => any[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// --- Mappers ---

const mapCourseFromApi = (data: any): Course => ({
    id: data.id,
    title: data.title,
    description: data.description,
    instructorId: data.instructor_id,
    instructorName: data.instructor?.name || 'Unknown Instructor', // Assuming backend might expand
    level: data.level,
    category: data.category,
    price: data.price,
    thumbnail: data.thumbnail || '/placeholder.svg',
    duration: data.duration || '0m',
    rating: data.rating || 0,
    enrolledCount: data.enrolled_count || 0,
    isPublished: data.is_published || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    modules: (data.modules || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        lessons: (m.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            type: l.type,
            duration: l.duration,
            videoUrl: l.video_url,
            isFree: l.is_free
        }))
    })),
    isFree: data.price === 0
});

const mapEnrollmentFromApi = (data: any): Enrollment => ({
    id: data.id,
    courseId: data.course_id,
    userId: data.user_id,
    progress: data.progress || 0,
    completedLessons: data.completed_lessons || [],
    enrolledAt: data.created_at
});

const mapCourseToApi = (data: any) => {
    const mapped: any = { ...data };
    if (mapped.instructorId) { mapped.instructor_id = mapped.instructorId; delete mapped.instructorId; }
    if (mapped.isFree !== undefined) { mapped.is_free = mapped.isFree; delete mapped.isFree; }
    if (mapped.isPublished !== undefined) { mapped.is_published = mapped.isPublished; delete mapped.isPublished; }
    if (mapped.enrolledCount !== undefined) { delete mapped.enrolledCount; }
    if (mapped.level) { mapped.level = mapped.level.toUpperCase(); }
    return mapped;
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // --- Queries ---

    const { data: courses = [], isLoading: isLoadingCourses, error: coursesError } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const data = await api.courses.list();
            return data.map(mapCourseFromApi);
        }
    });

    const { data: enrollments = [], isLoading: isLoadingEnrollments, error: enrollmentsError } = useQuery({
        queryKey: ['enrollments', user?.id],
        enabled: !!user,
        queryFn: async () => {
            try {
                const data = await api.enrollments.list();
                return data.map(mapEnrollmentFromApi);
            } catch (error) {
                console.warn("Failed to fetch enrollments", error);
                throw error; // Let react-query handle it
            }
        },
        retry: 1
    });

    // --- Mutations ---

    const createCourseMutation = useMutation({
        mutationFn: api.courses.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Course created!");
        }
    });

    const updateCourseMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.courses.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Course updated!");
        }
    });

    const deleteCourseMutation = useMutation({
        mutationFn: api.courses.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Course deleted!");
        }
    });

    const enrollMutation = useMutation({
        mutationFn: api.courses.enroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            toast.success("Enrolled successfully!");
        }
    });

    const togglePublishMutation = useMutation({
        mutationFn: ({ id, isPublished }: { id: string, isPublished: boolean }) => api.courses.togglePublish(id, isPublished),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Status updated!");
        }
    });

    const updateProgressMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { progress: number, completed_lessons: string[] } }) =>
            api.enrollments.updateProgress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        }
    });

    // Module/Lesson Mutations (Wrappers around API)
    const addModuleMutation = useMutation({
        mutationFn: ({ courseId, data }: { courseId: string, data: any }) => api.courses.addModule(courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Module added");
        }
    });

    const removeModuleMutation = useMutation({
        mutationFn: ({ courseId, moduleId }: { courseId: string, moduleId: string }) => api.courses.removeModule(courseId, moduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Module removed");
        }
    });

    const addLessonMutation = useMutation({
        mutationFn: ({ courseId, moduleId, data }: { courseId: string, moduleId: string, data: any }) => api.courses.addLesson(courseId, moduleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Lesson added");
        }
    });

    const removeLessonMutation = useMutation({
        mutationFn: ({ courseId, moduleId, lessonId }: { courseId: string, moduleId: string, lessonId: string }) => api.courses.removeLesson(courseId, moduleId, lessonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Lesson removed");
        }
    });


    // --- Public Implementation ---

    const getCourse = (id: string) => courses.find(c => c.id === id);

    const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);

    const getEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId);
    // Alias similar to getEnrollment
    const getCourseEnrollment = getEnrollment;

    const getCourseCompletionStatus = (courseId: string) => {
        const enrollment = getEnrollment(courseId);
        return enrollment ? enrollment.progress : 0;
    };


    const addCourse = async (data: any) => {
        const apiData = mapCourseToApi(data);
        await createCourseMutation.mutateAsync(apiData);
    };

    const updateCourse = async (id: string, data: any) => {
        const apiData = mapCourseToApi(data);
        await updateCourseMutation.mutateAsync({ id, data: apiData });
    };

    const removeCourse = async (id: string) => {
        await deleteCourseMutation.mutateAsync(id);
    };

    const togglePublishCourse = async (id: string, isPublished: boolean) => {
        // Backend toggles strict state via endpoint, argument is unused by API but kept for consistency
        await togglePublishMutation.mutateAsync({ id, isPublished });
    };

    const enrollInCourse = async (courseId: string) => {
        if (!user) {
            toast.error("Please login to enroll");
            return;
        }
        await enrollMutation.mutateAsync(courseId);
    };

    // Stubs
    const unenrollFromCourse = async (courseId: string) => {
        console.warn("Unenroll not implemented in API yet");
        toast.info("Unenrollment not supported yet");
    };

    const updateLessonProgress = async (enrollmentId: string, progress: number, completedLessons: string[]) => {
        await updateProgressMutation.mutateAsync({
            id: enrollmentId,
            data: { progress, completed_lessons: completedLessons } // Map back to snake_case for API
        });
    };

    const addModule = async (courseId: string, data: any) => {
        await addModuleMutation.mutateAsync({ courseId, data });
    };
    const removeModule = async (courseId: string, moduleId: string) => {
        await removeModuleMutation.mutateAsync({ courseId, moduleId });
    };
    const addLesson = async (courseId: string, moduleId: string, data: any) => {
        const apiData = { ...data };
        if (apiData.contentType) { apiData.type = apiData.contentType; delete apiData.contentType; }
        await addLessonMutation.mutateAsync({ courseId, moduleId, data: apiData });
    };
    const removeLesson = async (courseId: string, moduleId: string, lessonId: string) => {
        await removeLessonMutation.mutateAsync({ courseId, moduleId, lessonId });
    };

    // Quiz Stubs
    const getQuiz = (lessonId: string) => {
        // Return dummy quiz data or undefined
        return null;
    };
    const submitQuizAttempt = async (lessonId: string, answers: any[]) => {
        return { passed: true, score: 100 };
    };
    const getBestAttempt = (lessonId: string) => {
        return null;
    };

    // Certificate Stubs
    const generateCertificate = async (courseId: string) => {
        return "cert-id-123";
    };
    const getCertificate = (courseId: string) => {
        return null;
    };
    const getUserCertificates = (userId?: string) => [];

    return (
        <CourseContext.Provider value={{
            courses,
            enrollments,
            isLoading: isLoadingCourses || isLoadingEnrollments,
            error: coursesError || enrollmentsError,
            getCourse,
            isEnrolled,
            getEnrollment,
            getCourseEnrollment,
            getCourseCompletionStatus,
            addCourse,
            updateCourse,
            removeCourse,
            togglePublishCourse,
            addModule,
            removeModule,
            addLesson,
            removeLesson,
            enrollInCourse,
            unenrollFromCourse,
            updateLessonProgress,
            getQuiz,
            submitQuizAttempt,
            getBestAttempt,
            generateCertificate,
            getCertificate,
            getUserCertificates
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
