import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { LoginCredentials, AuthStatus, RegisterCredentials } from "@/types/auth";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("")
    const setAuth = useAuthStore((state) => state.setAuth);
    const logout = useAuthStore((state) => state.logout);

    /**
     * function for login user
     */
    const loginUser = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            //get token from api
            const { data: tokens } = await authService.login(credentials);
            /**
             * fetch the user data from api as it get token
             */
            const { data: user } = await authService.getUserProfile(tokens.access);
            //save to zustand 
            setAuth(tokens.access, tokens.refresh, user);
            //  give success response
            return { success: true };

        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors || "Login failed";
            setError(errorMessage)
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }
    /**
     * function to register user
     */
    const registerUser = async (data: RegisterCredentials): Promise<AuthStatus> => {
        setIsLoading(true);
        try {
            //register user
            await authService.register(data);
            //after register user login
            return await loginUser({ email: data.email, password: data.password })

        } catch (error: any) {
            console.log("Registration error:", JSON.stringify(error.response?.data, null, 2));
            const errorData = error.response?.data;
            const errorMessage =
                errorData?.detail ||
                errorData?.non_field_errors?.[0] ||
                errorData?.username?.[0] ||
                errorData?.email?.[0] ||
                errorData?.password?.[0] ||
                "Registration failed";
            setError(errorMessage)
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * function for logout user
     */
    const handleLogout = () => {
        logout();
    }

    return {
        isLoading,
        error,
        loginUser,
        handleLogout,
        registerUser
    }
}