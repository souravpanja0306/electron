import axios from "axios";
import { baseURL } from "../../../utils/baseUrl";
const token = localStorage.getItem("token");

export const handleSubmit = async (data) => {
    try {
        let result = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: `${baseURL.invoice}invoice-create`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(data),
        });
        return result.data;
    } catch (error) {
        console.log(error);
    };
};

export const handleGenerateInvoiceNo = async () => {
    try {
        let result = await axios.request({
            method: 'get',
            maxBodyLength: Infinity,
            url: `${baseURL.invoice}generate-invoice-no?types=invoice`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (result.data.status === 200) {
            return result.data.body;
        };
    } catch (error) {
        console.log(error);
    };
};

export const handleGetParty = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/party/party-list",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};