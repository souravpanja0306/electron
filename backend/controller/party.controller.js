const PartyService = require("../service/party.service");

const createParty = async (data) => {
    try {
        await PartyService.addParty(data);
        return {
            status: 200,
            message: "Data created successfully",
            body: []
        };
    } catch (error) {
        console.log("Something went worng: Controller: createParty: ", error);
    };
};

const getAllParty = async (params = {}) => {
    try {
        const result = await PartyService.listParty(params);
        return {
            status: 200,
            message: "Data fetched successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: getAllParty: ", error);
    };
};

const deleteParty = async (params = {}) => {
    try {
        const result = await PartyService.removeParty(params);
        return {
            status: 200,
            message: "Data deleted successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: deleteParty: ", error);
    };
};

module.exports = { createParty, getAllParty, deleteParty };