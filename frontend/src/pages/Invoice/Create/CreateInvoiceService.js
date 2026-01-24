import axios from "axios";

export const handleSubmit = async (data) => {
    try {
        let result = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:3001/api/v1/invoice/invoice-create',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
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
            url: 'http://localhost:3001/api/v1/invoice/generate-invoice-no?types=invoice',
            headers: {}
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
        url: "http://localhost:3001/api/v1/party/party-list"
    });
    return result.data;
};