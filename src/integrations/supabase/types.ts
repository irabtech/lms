export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            certificates: {
                Row: {
                    completed_at: string
                    course_id: string
                    id: string
                    instructor_name: string
                    user_id: string
                }
                Insert: {
                    completed_at?: string
                    course_id: string
                    id?: string
                    instructor_name: string
                    user_id: string
                }
                Update: {
                    completed_at?: string
                    course_id?: string
                    id?: string
                    instructor_name?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "certificates_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            courses: {
                Row: {
                    category: string | null
                    created_at: string
                    description: string
                    duration: string | null
                    id: string
                    instructor_id: string
                    is_published: boolean
                    level: Database["public"]["Enums"]["course_level"]
                    price: number
                    rating: number | null
                    thumbnail: string | null
                    title: string
                    updated_at: string
                }
                Insert: {
                    category?: string | null
                    created_at?: string
                    description: string
                    duration?: string | null
                    id?: string
                    instructor_id: string
                    is_published?: boolean
                    level?: Database["public"]["Enums"]["course_level"]
                    price?: number
                    rating?: number | null
                    thumbnail?: string | null
                    title: string
                    updated_at?: string
                }
                Update: {
                    category?: string | null
                    created_at?: string
                    description?: string
                    duration?: string | null
                    id?: string
                    instructor_id?: string
                    is_published?: boolean
                    level?: Database["public"]["Enums"]["course_level"]
                    price?: number
                    rating?: number | null
                    thumbnail?: string | null
                    title?: string
                    updated_at?: string
                }
                Relationships: []
            }
            enrollments: {
                Row: {
                    completed_lessons: string[]
                    course_id: string
                    enrolled_at: string
                    id: string
                    progress: number
                    user_id: string
                }
                Insert: {
                    completed_lessons?: string[]
                    course_id: string
                    enrolled_at?: string
                    id?: string
                    progress?: number
                    user_id: string
                }
                Update: {
                    completed_lessons?: string[]
                    course_id?: string
                    enrolled_at?: string
                    id?: string
                    progress?: number
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "enrollments_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            lessons: {
                Row: {
                    content: string | null
                    content_type: Database["public"]["Enums"]["content_type"]
                    created_at: string
                    duration: string | null
                    id: string
                    module_id: string
                    order: number
                    title: string
                    updated_at: string
                }
                Insert: {
                    content?: string | null
                    content_type?: Database["public"]["Enums"]["content_type"]
                    created_at?: string
                    duration?: string | null
                    id?: string
                    module_id: string
                    order?: number
                    title: string
                    updated_at?: string
                }
                Update: {
                    content?: string | null
                    content_type?: Database["public"]["Enums"]["content_type"]
                    created_at?: string
                    duration?: string | null
                    id?: string
                    module_id?: string
                    order?: number
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "lessons_module_id_fkey"
                        columns: ["module_id"]
                        isOneToOne: false
                        referencedRelation: "modules"
                        referencedColumns: ["id"]
                    },
                ]
            }
            modules: {
                Row: {
                    course_id: string
                    created_at: string
                    description: string | null
                    id: string
                    order: number
                    title: string
                    updated_at: string
                }
                Insert: {
                    course_id: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    order?: number
                    title: string
                    updated_at?: string
                }
                Update: {
                    course_id?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    order?: number
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "modules_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar: string | null
                    bio: string | null
                    created_at: string
                    email: string
                    id: string
                    name: string
                    updated_at: string
                }
                Insert: {
                    avatar?: string | null
                    bio?: string | null
                    created_at?: string
                    email: string
                    id: string
                    name: string
                    updated_at?: string
                }
                Update: {
                    avatar?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string
                    updated_at?: string
                }
                Relationships: []
            }
            questions: {
                Row: {
                    correct_answer: number
                    created_at: string
                    id: string
                    options: string[]
                    quiz_id: string
                    text: string
                    type: Database["public"]["Enums"]["question_type"]
                    updated_at: string
                }
                Insert: {
                    correct_answer: number
                    created_at?: string
                    id?: string
                    options?: string[]
                    quiz_id: string
                    text: string
                    type?: Database["public"]["Enums"]["question_type"]
                    updated_at?: string
                }
                Update: {
                    correct_answer?: number
                    created_at?: string
                    id?: string
                    options?: string[]
                    quiz_id?: string
                    text?: string
                    type?: Database["public"]["Enums"]["question_type"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "questions_quiz_id_fkey"
                        columns: ["quiz_id"]
                        isOneToOne: false
                        referencedRelation: "quizzes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            quiz_attempts: {
                Row: {
                    answers: number[]
                    attempted_at: string
                    id: string
                    passed: boolean
                    quiz_id: string
                    score: number
                    user_id: string
                }
                Insert: {
                    answers?: number[]
                    attempted_at?: string
                    id?: string
                    passed?: boolean
                    quiz_id: string
                    score?: number
                    user_id: string
                }
                Update: {
                    answers?: number[]
                    attempted_at?: string
                    id?: string
                    passed?: boolean
                    quiz_id?: string
                    score?: number
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quiz_attempts_quiz_id_fkey"
                        columns: ["quiz_id"]
                        isOneToOne: false
                        referencedRelation: "quizzes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            quizzes: {
                Row: {
                    created_at: string
                    id: string
                    lesson_id: string
                    passing_score: number
                    title: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    lesson_id: string
                    passing_score?: number
                    title: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    lesson_id?: string
                    passing_score?: number
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quizzes_lesson_id_fkey"
                        columns: ["lesson_id"]
                        isOneToOne: true
                        referencedRelation: "lessons"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_roles: {
                Row: {
                    id: string
                    role: Database["public"]["Enums"]["app_role"]
                    user_id: string
                }
                Insert: {
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    user_id: string
                }
                Update: {
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    user_id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            can_access_course: {
                Args: { _course_id: string; _user_id: string }
                Returns: boolean
            }
            get_course_from_lesson: { Args: { _lesson_id: string }; Returns: string }
            get_course_from_module: { Args: { _module_id: string }; Returns: string }
            get_course_from_quiz: { Args: { _quiz_id: string }; Returns: string }
            has_role: {
                Args: {
                    _role: Database["public"]["Enums"]["app_role"]
                    _user_id: string
                }
                Returns: boolean
            }
            is_admin: { Args: { _user_id: string }; Returns: boolean }
            is_course_instructor: {
                Args: { _course_id: string; _user_id: string }
                Returns: boolean
            }
            is_enrolled: {
                Args: { _course_id: string; _user_id: string }
                Returns: boolean
            }
            is_instructor: { Args: { _user_id: string }; Returns: boolean }
        }
        Enums: {
            app_role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
            content_type: "VIDEO" | "TEXT" | "QUIZ"
            course_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
            question_type: "MCQ" | "TRUE_FALSE"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            app_role: ["STUDENT", "INSTRUCTOR", "ADMIN"],
            content_type: ["VIDEO", "TEXT", "QUIZ"],
            course_level: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            question_type: ["MCQ", "TRUE_FALSE"],
        },
    },
} as const
