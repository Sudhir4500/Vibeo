import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string; // ✅ Make optional
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    setAuth: (token: string, refreshToken: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            setAuth: (token, refreshToken, user) => {
                set({ token, refreshToken, user });
            },
            logout: () => {
                set({ token: null, refreshToken: null, user: null });
            }
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);