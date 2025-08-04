import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            try {
                const decoded = jwtDecode(parsedUser.token);
                const isExpired = Date.now() >= decoded.exp * 1000;

                if (!isExpired) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem("user");
                }
            } catch (err) {
                console.error("Token inválido no carregamento:", err);
                localStorage.removeItem("user");
            }
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    const decoded = jwtDecode(parsed.token);
                    const isExpired = Date.now() >= decoded.exp * 1000;

                    if (isExpired) {
                        logout();
                        window.location.href = '/login';
                    }
                } catch (err) {
                    console.error("Token inválido:", err);
                    logout();
                    window.location.href = '/login';
                }
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);


    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
