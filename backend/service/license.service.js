const {db} = require("../database/connection");
const LicenseModel = require("../database/model/license.model");

exports.createLicense = async (data) => {
    try {
        let newData = new LicenseModel(data);
        let result = await newData.save();
        return result;
    } catch (error) {
        console.log(error);
    };
};

exports.createHSNSAC = async (data) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO hsn_sac (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};