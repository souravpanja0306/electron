import axios from "axios";

export const getParty = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/party/party-list"
    });
    return result.data;
};