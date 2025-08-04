import api from "../api/api";

export const createUser = async (userData) => {
    try {
        const response = await api.post("/auth/register", userData);
        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export async function loginUser(payload) {
    return await api.post('/auth/login', payload);
}

export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post("/auth/request-reset-password", email);
        return response;
    } catch (error) {
        console.error("Error requesting password reset:", error);
        throw error;
    }
};

export const resetPassword = async (userId, token, newPassword) => {
    try {
        const response = await api.post(`/auth/reset-password/${userId}/${token}`, {
            newPassword: newPassword,
        });
        return response;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
}
