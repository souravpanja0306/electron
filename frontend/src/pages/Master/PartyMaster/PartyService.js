import axios from "axios";
import { baseURL } from "../../../utils/baseUrl";

const token = localStorage.getItem("token");

export const handleCreateParty = async (data) => {
    try {
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
    };
};

export const handleGetParty = async () => {
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