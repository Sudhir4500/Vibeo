import client from "@/api/client";
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    RegisterResponse,
    UserProfile
} from "@/types/auth";

export const authService = {
    // Register new user (returns user)
    register: (credentials: RegisterCredentials) =>
        client.post<RegisterResponse>("/auth/users/", credentials),

    // Login user (returns tokens)
    login: (credentials: LoginCredentials) =>
        client.post<AuthResponse>("/auth/jwt/create/", credentials),

    // Get current user profile
    getUserProfile: (token?: string) =>
        client.get<UserProfile>("/auth/users/me/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }),

    // Refresh access token
    refreshToken: (refreshToken: string) =>
        client.post<{ access: string }>("/auth/jwt/refresh/", {
            refresh: refreshToken
        }),
};