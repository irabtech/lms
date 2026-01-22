import { supabase } from '@/integrations/supabase/client';

const BASE_URL = "https://jeqotvuzlygdrexfduct.supabase.co/functions/v1";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function fetchWrapper<T>(endpoint: string, method: RequestMethod = 'GET', body?: any): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API] ${method} ${endpoint}`, { headers, body });

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses (e.g., 204 No Content or strictly empty 200)
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}

export const api = {
    auth: {
        register: (data: { name: string, email: string, password: string, role: 'STUDENT' | 'INSTRUCTOR' }) =>
            fetchWrapper<{ token: string, user: any }>('/auth/register', 'POST', data),

        login: (data: { email: string, password: string }) =>
            fetchWrapper<{ token: string, user: any }>('/auth/login', 'POST', data),

        getMe: () => fetchWrapper<{ user: any }>('/auth/me', 'GET'),
    },

    courses: {
        list: async () => {
            // Manual Fetch with Join equivalent
            const { data: courses, error } = await supabase.from('courses').select('*');
            if (error) throw error;

            if (!courses) return [];

            // Fetch instructors manually
            const instructorIds = [...new Set(courses.map(c => c.instructor_id))];
            const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', instructorIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            return courses.map(course => ({
                ...course,
                instructor: profileMap.get(course.instructor_id) || { name: 'Unknown' }
            }));
        },

        get: async (id: string) => {
            const { data: course, error } = await supabase.from('courses').select('*').eq('id', id).single();
            if (error) throw error;
            if (!course) return null;

            // Fetch instructor
            const { data: instructor } = await supabase.from('profiles').select('id, name, avatar, bio').eq('id', course.instructor_id).single();

            // Fetch modules & lessons (nested)
            const { data: modules } = await supabase.from('modules').select('*, lessons(*, quizzes(*))').eq('course_id', id).order('order');

            const sortedModules = modules?.map(mod => ({
                ...mod,
                lessons: mod.lessons?.sort((a, b) => a.order - b.order)
            }));

            return {
                ...course,
                instructor: instructor || { name: 'Unknown' },
                modules: sortedModules
            };
        },

        create: async (data: { title: string, description: string, level: string, price: number, category: string }) => {
            const res = await fetchWrapper<{ course: any }>('/courses', 'POST', data);
            return res.course;
        },

        update: async (id: string, data: any) => {
            const res = await fetchWrapper<{ course: any }>(`/courses/${id}`, 'PUT', data);
            return res.course;
        },

        delete: (id: string) => fetchWrapper<any>(`/courses/${id}`, 'DELETE'),

        enroll: async (id: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // Check if already enrolled
            const { data: existing } = await supabase.from('enrollments').select('id').eq('course_id', id).eq('user_id', user.id).single();
            if (existing) return existing;

            const { data: enrollment, error } = await supabase.from('enrollments').insert({
                course_id: id,
                user_id: user.id
            }).select().single();

            if (error) throw error;
            return enrollment;
        },

        togglePublish: async (id: string, _isPublished: boolean) => {
            // Backend toggles state blindly via /publish endpoint
            const res = await fetchWrapper<{ course: any }>(`/courses/${id}/publish`, 'PATCH');
            return res.course;
        },

        addModule: (courseId: string, data: { title: string, description: string, order: number }) =>
            fetchWrapper<any>(`/courses/${courseId}/modules`, 'POST', data),

        removeModule: (courseId: string, moduleId: string) =>
            fetchWrapper<any>(`/courses/${courseId}/modules/${moduleId}`, 'DELETE'),

        addLesson: (courseId: string, moduleId: string, data: any) =>
            fetchWrapper<any>(`/courses/${courseId}/modules/${moduleId}/lessons`, 'POST', data),

        removeLesson: (courseId: string, moduleId: string, lessonId: string) =>
            fetchWrapper<any>(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, 'DELETE'),
    },

    enrollments: {
        list: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Fetch enrollments for current user
            const { data: enrollments, error } = await supabase.from('enrollments')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            if (!enrollments) return [];

            // Fetch related courses
            const courseIds = enrollments.map(e => e.course_id);
            const { data: courses } = await supabase.from('courses')
                .select('*')
                .in('id', courseIds);
            // Fetch instructors for those courses
            const instructorIds = [...new Set(courses?.map(c => c.instructor_id) || [])];
            const { data: profiles } = await supabase.from('profiles')
                .select('id, name, avatar')
                .in('id', instructorIds);
            const profileMap = new Map(profiles?.map(p => [p.id, p]));
            const courseMap = new Map(courses?.map(c => [c.id, {
                ...c,
                instructor: profileMap.get(c.instructor_id) || { name: 'Unknown' }
            }]));
            return enrollments.map(e => ({
                ...e,
                course: courseMap.get(e.course_id)
            }));
        },
        updateProgress: async (id: string, data: { progress: number, completed_lessons: string[] }) => {
            const { data: updated, error } = await supabase
                .from('enrollments')
                .update({ progress: data.progress, completed_lessons: data.completed_lessons })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return updated;
        },
    },

    users: {
        get: (id: string) => fetchWrapper<any>(`/users/${id}`, 'GET'),
        update: (id: string, data: { name?: string, avatar?: string, bio?: string }) =>
            fetchWrapper<any>(`/users/${id}`, 'PUT', data),
    }
};
