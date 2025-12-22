const Service = require("../service/user.service");

const createParty = async (data) => {
    try {
        await Service.addUser(data);
        return {
            status: "200",
            message: "User created successfully",
            body: []
        };
    } catch (error) {
        console.log("Something went worng: Controller: createParty: ", error);
    };
};

const getAllParty = async (params = {}) => {
    try {
        const result = await Service.listParty(params);
        return {
            status: "200",
            message: "User created successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: getAllParty: ", error);
    };
};

const deleteParty = async (params = {}) => {
    try {
        const result = await Service.removeParty(params);
        return {
            status: "200",
            message: "User created successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: deleteParty: ", error);
    };
};

module.exports = { createParty, getAllParty, deleteParty };