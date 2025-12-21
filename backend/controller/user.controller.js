const Service = require("../service/user.service");

const createUser = async (data) => {
    try {
        await Service.addUser(data);
        return {
            status: "200",
            message: "User created successfully",
            body: []
        };
    } catch (error) {
        console.log("Something went worng: Controller: createUser: ", error);
    };
};

const getAllUser = async (params = {}) => {
    try {
        const result = await Service.listUsers(params);
        return {
            status: "200",
            message: "User created successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: getAllUser: ", error);
    };
};


const deleteUser = async (params = {}) => {
    try {
        const result = await Service.removeUsers(params);
        return {
            status: "200",
            message: "User created successfully",
            body: result
        };
    } catch (error) {
        console.log("Something went worng: Controller: deleteUser: ", error);
    };
};

module.exports = { createUser, getAllUser, deleteUser };
