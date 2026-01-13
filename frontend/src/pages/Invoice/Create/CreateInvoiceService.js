import axios from "axios";

export const handleSubmit = async (e, invoiceFields) => {
    console.log(invoiceFields);
};

export const handleGetParty = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/party/party-list"
    });
    return result.data;
};