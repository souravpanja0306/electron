import axios from "axios";

export const getToken = async () => {
    try {
        let token = await window.api?.getItem("token");
        return token;
    } catch (error) {
        console.log("Something went wrong", error);
        throw error;
    };
};

export const signinUser = async (payload) => {
    console.log("🚀 ~ signinUser ~ payload:", payload)
    try {
        let response = await axios({
            method: "post",
            url: "http://localhost:3001/api/v1/auth/signin",
            headers: {
                "Content-Type": "application/json",
            },
            data: payload,
            validateStatus: (status) => status < 500,
        });
        console.log("🚀 ~ signinUser ~ response:", response)
        return response.data;
    } catch (error) {
        console.log("Something went wrong", error);
        throw error;
    };
};

export const signupUser = async (payload) => {
    try {
        let response = await axios({
            method: "post",
            url: "http://localhost:3001/api/v1/auth/signup",
            headers: {
                "Content-Type": "application/json",
            },
            data: payload,
            validateStatus: (status) => status < 500,
        });
        return response.data;
    } catch (error) {
        console.log("Something went wrong", error);
        throw error;
    };
};