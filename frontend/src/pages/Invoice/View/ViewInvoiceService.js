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