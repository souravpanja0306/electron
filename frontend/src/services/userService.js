import axios from "axios";

export const getProfile = async (token) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/v1/user/get-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const updateProfile = async (data, token) => {
    try {
        const response = await axios.put(`http://localhost:3001/api/v1/user/update-profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};
