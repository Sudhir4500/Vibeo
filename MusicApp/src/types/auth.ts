// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Register credentials (Djoser expects re_password)
export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    re_password?: string; // Password confirmation (optional)
}

// Response from /auth/jwt/create/ (login)
export interface AuthResponse {
    access: string;
    refresh: string;
}

// Response from /auth/users/ (register)
export interface RegisterResponse {
    id: string;
    username: string;
    email: string;
}

// Response from /auth/users/me/ (get profile)
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

// For error and success messages
export interface AuthStatus {
    success: boolean;
    error?: string;
    message?: string; // Optional success message
}

// For API error responses
export interface ApiError {
    detail?: string;
    email?: string[];
    username?: string[];
    password?: string[];
    non_field_errors?: string[];
}