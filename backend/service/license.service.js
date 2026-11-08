const LicenseModel = require("../database/model/license.model");

module.exports.createLicense = async (data) => {
    try {
        let newData = new LicenseModel(data);
        let result = await newData.save();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

module.exports.deleteLicense = async ({ license_key }) => {
    if (!license_key) return null;
    return LicenseModel.deleteOne({ license_key });
};
