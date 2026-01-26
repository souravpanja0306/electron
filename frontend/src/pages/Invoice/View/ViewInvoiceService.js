import axios from "axios";
const token = localStorage.getItem("token");

export const handleGetAllInvoice = async ({
    id = ""
}) => {
    try {
        let queries = `?`;
        if (id) queries += `id=${id}`;

        let result = await axios({
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://localhost:3001/api/v1/invoice/invoice-list${queries}`,
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

export const handleGetParty = async ({

}) => {
    try {
    } catch (error) {
        console.log(`Something went wrong : handleGetParty : ${error}`)
    }
    if (!window.api) return;

    let res = await window.api.getParty({});
    if (res.body.length) {
        res.body.map(item => item.is_selected = false)
    };
    return res.body;
};

export const handleDeleteParty = async ({

}) => {
    try {
        if (!window.api) return;

        let res = await window.api.getParty({});
        if (res.body.length) {
            res.body.map(item => item.is_selected = false)
        };
        return res.body;
    } catch (error) {
        console.log(`Something went wrong : handleDeleteParty : ${error}`)
    };
};