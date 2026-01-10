export const handleSubmit = async (e, invoiceFields) => {
    console.log(invoiceFields);
};

export const handleGetParty = async () => {
    if (!window.api) return;

    let res = await window.api.getParty({});
    return res.body;
};