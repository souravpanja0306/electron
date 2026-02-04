import axios from "axios";
import { baseURL } from "../../utils/baseUrl";
const token = localStorage.getItem("token");

export const handleGenerateMoneyReceiptNo = async () => {
    try {
        let result = await axios.request({
            method: 'get',
            maxBodyLength: Infinity,
            url: `${baseURL.moneyreceipt}generate-receipt-no?types=moneyreceipt`,
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