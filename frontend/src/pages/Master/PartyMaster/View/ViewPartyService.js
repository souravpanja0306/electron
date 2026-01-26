import axios from "axios";
import { baseURL } from "../../../../utils/baseUrl";

const token = localStorage.getItem("token");

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