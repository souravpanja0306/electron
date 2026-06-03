import axios from "axios";
import { baseURL } from "../../../utils/baseUrl";

export const handleCreateParty = async (data) => {
    try {
        const token = window.api?.getItem("token");
        let result = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: `${baseURL.party}party-create`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: data,
        });
        return result.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { status: 500, message: "Something went wrong!" };
    };
};

export const handleGetParty = async () => {
    const token = window.api?.getItem("token");
    let result = await axios({
        method: "get",
        url: `${baseURL.party}party-list`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};

export const handleGetPartyById = async (id) => {
    const token = window.api?.getItem("token");
    let result = await axios({
        method: "get",
        url: `${baseURL.party}party-list?id=${id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};

export const handleUpdateParty = async (id, data) => {
    try {
        const token = window.api?.getItem("token");
        let result = await axios.request({
            method: 'put',
            maxBodyLength: Infinity,
            url: `${baseURL.party}party-update/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: data,
        });
        return result.data;
    } catch (error) {
        console.log(error);
        return error?.response?.data || { status: 500, message: "Something went wrong!" };
    };
};