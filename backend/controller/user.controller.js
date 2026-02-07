// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const AdminService = require("../service/admin.service");
const UserService = require("../service/user.service");
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.addUser = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { name, mobile, email, username, password, address_1,
            address_2, city, state, district, pincode, country,
            gst, pan, trade_licence, bank, ifse, branch, account_no,
            is_active, is_deleted, } = req.body;

        let finalData = {
            name: name,
            mobile: mobile,
            email: email,
            username: username,
            password: password,
            address_1: address_1,
            address_2: address_2,
            city: city,
            state: state,
            district: district,
            pincode: pincode,
            country: country,
            gst: gst,
            pan: pan,
            trade_licence: trade_licence,
            bank: bank,
            ifse: ifse,
            branch: branch,
            account_no: account_no,
        };

        let result = await UserService.insertUsers(finalData);
        response.status = 200;
        response.message = "Users Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: addUser: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: addUser`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.listUsers = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { skip, limit, id } = req.query;
        let result = await UserService.getUsers({ limit: limit, skip: skip, id: id });
        if (result.length) {
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = result;
        } else {
            response.status = 404;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: listUsers: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: listUsers`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.getUsers = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;

        let search_key = {};
        if (id) search_key["id"] = id;

        let result = await UserService.getUsers(search_key);
        if (result.length) {
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = result;
        } else {
            response.status = 404;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getUsers: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getUsers`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.removeUsers = async (req, res) => {
    let response = contents.defaultResponse;
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: removeUsers: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: removeUsers`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};