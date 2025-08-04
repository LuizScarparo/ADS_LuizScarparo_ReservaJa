import api from "../api/api";

export const getMenu = async () => {
    try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await api.get('/menu/menus', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
};