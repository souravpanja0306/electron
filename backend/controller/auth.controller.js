// Package...
const moment = require("moment");
const jwt = require("jsonwebtoken")

// Contents...
const contents = require("../content/contents");

// Services...
const UserService = require("../service/user.service");
const AdminService = require("../service/admin.service")
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.signin = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { username, password } = req.body;
        if (!username) {
            response.status = 403;
            response.message = "Username Required.";
            response.body = result;
            return res.status(response.status).json(response);
        };
        if (!password) {
            response.status = 403;
            response.message = "Username Required.";
            response.body = result;
            return res.status(response.status).json(response);
        };
        let getUserDetails = await UserService.getUsers({
            password: password,
            username: username,
        });
        if (getUserDetails.length) {
            let tokenData = {
                TOKEN_UID: getUserDetails[0].id,
                TOKEN_MOBILE: getUserDetails[0].mobile,
                TONEN_USERNAME: getUserDetails[0].username,
                TONEN_NAME: getUserDetails[0].name,
            };
            let token = jwt.sign(tokenData, "secretOrPrivateKey");

            response.status = 200;
            response.message = "User Signin Succesfull";
            response.body = {
                name: getUserDetails[0].name,
                id: getUserDetails[0].id,
                token: token,
            };
        } else {
            response.status = 403;
            response.message = "Incorrect Username Or Password! Please Contect to Adminitrator...";
            response.body = result;
            return res.status(response.status).json(response);
        };
    } catch (error) {
        console.log(`Something went wrong: controller: signin: ${error}`);
    };
    return res.status(response.status).json(response);
};

exports.forgotPassword = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: forgotPassword: ${error}`);
    };
    return res.status(response.status).json(response);
};

exports.resetPassword = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: resetPassword: ${error}`);
    };
    return res.status(response.status).json(response);
};