import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    roles: string[]; // ["STUDENT"] or ["INSTRUCTOR"] etc.
    avatar?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: 'STUDENT' | 'INSTRUCTOR') => Promise<void>;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Sync session with Supabase client
                const { user } = await api.auth.getMe();

                // Set session in Supabase client using the JWT
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: '', // We don't have a refresh token from the custom backend
                });

                if (sessionError) {
                    console.error("[AuthContext] setSession error during checkAuth:", sessionError);
                } else {
                    console.log("[AuthContext] session set successfully during checkAuth", sessionData);
                }

                setUser(user);
            } catch (error) {
                console.error("Session restore failed", error);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    };

    const login = async (email: string, password: string) => {
        try {
            const { token, user } = await api.auth.login({ email, password });
            localStorage.setItem('token', token);

            // Sync session with Supabase client
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: '',
            });

            if (sessionError) {
                console.error("[AuthContext] setSession error during login:", sessionError);
            } else {
                console.log("[AuthContext] session set successfully during login", sessionData);
            }

            setUser(user);
            toast.success("Welcome back!");
        } catch (error: any) {
            toast.error(error.message || "Login failed");
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, role: 'STUDENT' | 'INSTRUCTOR') => {
        try {
            const { token, user } = await api.auth.register({ name, email, password, role });
            localStorage.setItem('token', token);

            // Sync session with Supabase client
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: '',
            });

            if (sessionError) {
                console.error("[AuthContext] setSession error during register:", sessionError);
            } else {
                console.log("[AuthContext] session set successfully during register", sessionData);
            }

            setUser(user);
            toast.success("Account created successfully!");
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info("Logged out");
    };

    const hasRole = (role: string) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
