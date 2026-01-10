import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = "http://192.168.137.1:8000/api";

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request interceptor - automatically adds token to all requests
 */
client.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - handles token refresh on 401 errors
 */
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (refreshToken) {
                try {
                    // Call refresh token endpoint
                    const { data } = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });

                    // Update auth store with new access token
                    const currentUser = useAuthStore.getState().user;
                    if (currentUser) {
                        useAuthStore.getState().setAuth(
                            data.access,
                            refreshToken,
                            currentUser
                        );
                    }

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return client(originalRequest);

                } catch (refreshError) {
                    // Refresh token failed, logout user
                    useAuthStore.getState().logout();
                    // Optionally redirect to login page here
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available, logout
                useAuthStore.getState().logout();
            }
        }

        return Promise.reject(error);
    }
);

export default client;