
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

async function supabaseDirect<T>(table: string, method: RequestMethod = 'GET', body?: any, query: string = '', single: boolean = false): Promise<T> {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}${query}`;

    const headers: HeadersInit = {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[Supabase Direct] ${method} ${table}${query}`, { body });

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Supabase Direct] Error:`, errorData);
        throw new Error(errorData.message || errorData.error || `DB Error: ${response.status}`);
    }

    const data = await response.json();
    if (single && Array.isArray(data)) {
        return data[0] as T;
    }
    return data as T;
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
            // 1. Fetch courses
            const { data: courses, error } = await supabase.from('courses').select('*');
            if (error) throw error;
            if (!courses) return [];

            // 2. Fetch ALL modules and lessons for those courses (manual join)
            const courseIds = courses.map(c => c.id);
            const modules = await supabaseDirect<any[]>('modules', 'GET', undefined, `?course_id=in.(${courseIds.join(',')})&order=order.asc`);

            let lessons: any[] = [];
            if (modules.length > 0) {
                const moduleIds = modules.map(m => m.id);
                lessons = await supabaseDirect<any[]>('lessons', 'GET', undefined, `?module_id=in.(${moduleIds.join(',')})&order=order.asc`);
            }

            // 3. Fetch instructors
            const instructorIds = [...new Set(courses.map(c => c.instructor_id))];
            const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', instructorIds);
            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            // 4. Group modules by course and lessons by module
            const lessonsByModule = lessons.reduce((acc, l) => {
                if (!acc[l.module_id]) acc[l.module_id] = [];
                acc[l.module_id].push(l);
                return acc;
            }, {} as Record<string, any[]>);

            const modulesByCourse = modules.reduce((acc, m) => {
                if (!acc[m.course_id]) acc[m.course_id] = [];
                acc[m.course_id].push({
                    ...m,
                    lessons: lessonsByModule[m.id] || []
                });
                return acc;
            }, {} as Record<string, any[]>);

            return courses.map(course => ({
                ...course,
                instructor: profileMap.get(course.instructor_id) || { name: 'Unknown' },
                modules: modulesByCourse[course.id] || []
            }));
        },

        get: async (id: string) => {
            const { data: course, error } = await supabase.from('courses').select('*').eq('id', id).single();
            if (error) throw error;
            if (!course) return null;

            // Fetch instructor
            const { data: instructor } = await supabase.from('profiles').select('id, name, avatar, bio').eq('id', course.instructor_id).maybeSingle();

            // Fetch modules & lessons (manual join for reliability)
            const modules = await supabaseDirect<any[]>('modules', 'GET', undefined, `?course_id=eq.${id}&order=order.asc`);

            let lessons: any[] = [];
            if (modules.length > 0) {
                const moduleIds = modules.map(m => m.id);
                lessons = await supabaseDirect<any[]>('lessons', 'GET', undefined, `?module_id=in.(${moduleIds.join(',')})&order=order.asc`);
            }

            const lessonsByModule = lessons.reduce((acc, l) => {
                if (!acc[l.module_id]) acc[l.module_id] = [];
                acc[l.module_id].push(l);
                return acc;
            }, {} as Record<string, any[]>);

            const sortedModules = modules?.map(mod => ({
                ...mod,
                lessons: lessonsByModule[mod.id] || []
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
            let userId: string | undefined;
            try {
                const res = await api.auth.getMe();
                userId = res.user?.id;
            } catch (err) {
                console.error("[API] getMe() failed in enroll:", err);
            }

            if (!userId) {
                throw new Error("User not identified. Please log in again.");
            }

            console.log(`[API] Enrolling user ${userId} in course ${id} via Direct REST`);

            // Check if already enrolled (using direct REST)
            try {
                const existing = await supabaseDirect<any>('enrollments', 'GET', undefined, `?course_id=eq.${id}&user_id=eq.${userId}&select=id`, true);
                if (existing && existing.id) {
                    console.log("[API] User already enrolled");
                    return existing;
                }
            } catch (e) {
                // Ignore 404/Empty
            }

            const enrollment = await supabaseDirect<any>('enrollments', 'POST', {
                course_id: id,
                user_id: userId,
                progress: 0,
                completed_lessons: []
            }, '', true);

            console.log("[API] Enrollment successful:", enrollment);
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
            fetchWrapper<any>(`/modules/${moduleId}`, 'DELETE'),

        addLesson: (courseId: string, moduleId: string, data: any) =>
            fetchWrapper<any>(`/modules/${moduleId}/lessons`, 'POST', data),

        updateLesson: (courseId: string, moduleId: string, lessonId: string, data: any) =>
            fetchWrapper<any>(`/lessons/${lessonId}`, 'PUT', data),

        removeLesson: (courseId: string, moduleId: string, lessonId: string) =>
            fetchWrapper<any>(`/lessons/${lessonId}`, 'DELETE'),
    },

    enrollments: {
        list: async () => {
            let userId: string | undefined;
            try {
                const res = await api.auth.getMe();
                userId = res.user?.id;
            } catch (e) {
                console.warn("[API] Could not identify user for enrollments list");
            }

            if (!userId) return [];

            // Fetch enrollments for current user via Direct REST
            console.log(`[API] Fetching enrollments for user ${userId} via Direct REST`);
            const enrollments = await supabaseDirect<any[]>('enrollments', 'GET', undefined, `?user_id=eq.${userId}`);

            if (!enrollments || enrollments.length === 0) return [];

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
            const updated = await supabaseDirect<any>('enrollments', 'PATCH', {
                progress: data.progress,
                completed_lessons: data.completed_lessons
            }, `?id=eq.${id}`, true);
            return updated;
        },
    },

    users: {
        get: (id: string) => fetchWrapper<any>(`/users/${id}`, 'GET'),
        update: (id: string, data: { name?: string, avatar?: string, bio?: string }) =>
            fetchWrapper<any>(`/users/${id}`, 'PUT', data),
        listProfiles: () => supabaseDirect<any[]>('profiles', 'GET'),
        listUserRoles: () => supabaseDirect<any[]>('user_roles', 'GET')
    },

    certificates: {
        list: () => supabaseDirect<any[]>('certificates', 'GET'),
        getUserCertificates: (userId: string) =>
            supabaseDirect<any[]>('certificates', 'GET', undefined, `?user_id=eq.${userId}`)
    },

    admin: {
        getAllEnrollments: () => supabaseDirect<any[]>('enrollments', 'GET')
    }
};
