import { ReactNode, createContext, useContext, useState } from "react";
import { IUser } from "@/types/studies/user.ts";

export type AuthContextType = {
    user: IUser | undefined;
    login: (user: IUser) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const jsonString = localStorage.getItem("user");
    let currentUser: IUser | undefined;
    if (jsonString !== null) {
        currentUser = JSON.parse(jsonString);
    }

    const [user, setUser] = useState<IUser | undefined>(currentUser);

    const login = (user: IUser): void => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
    };

    const logout = (): void => {
        setUser(undefined);
        localStorage.removeItem("user");
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
    return useContext(AuthContext) as AuthContextType;
}
