const axios = require("axios");
const { machineIdSync } = require('node-machine-id');

module.exports.validateLicense = async () => {
    try {
        let machine_id = await machineIdSync({ original: false });
        // const res = await axios.post("https://your-api.com/validate", {
        //     license_key: "LOCAL_KEY",
        //     machine_id: "LOCAL_MACHINE_ID"
        // });

        // return res.data.valid === true;
    } catch (err) {
        return false;
    };
};