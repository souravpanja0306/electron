const { db } = require("../database/connection");
const LicenseModel = require("../database/model/license.model");

exports.createLicense = async (data) => {
    try {
        // let newData = new LicenseModel(data);
        // let result = await newData.save();
        // return result;
    } catch (error) {
        console.log(error);
    };
};