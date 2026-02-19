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

exports.signup = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { name, mobile, email, username, password } = req.body;
        let isEmailExist = await UserService.getUsers({ email: email });
        if (isEmailExist.length) return errorHandler(res, 403, "Email is already registered with us.");

        let isMobileExist = await UserService.getUsers({ mobile: mobile });
        if (isMobileExist.length) return errorHandler(res, 403, "Mobile is already registered with us.");

        let isUsernameExist = await UserService.getUsers({ username: username });
        if (isUsernameExist.length) return errorHandler(res, 403, "Username already taken, try another.");

        let newData = {
            name: name,
            mobile: mobile,
            email: email,
            username: username,
            password: password
        };
        let result = await UserService.insertUsers(newData);
        if (result) {
            let tokenData = {
                TOKEN_UID: result.id,
                TOKEN_MOBILE: result.mobile,
                TONEN_USERNAME: result.username,
                TONEN_NAME: result.name,
            };
            let token = jwt.sign(tokenData, "secretOrPrivateKey");

            response.status = 200;
            response.message = "User Signup Succesfull";
            response.body = {
                name: result.name,
                id: result.id,
                token: token,
            };
        };
    } catch (error) {
        console.log(`Something went wrong: controller: signup: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: signup`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.signin = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { username, password } = req.body;
        if (!username) return errorHandler(res, 403, "Username Required.");
        if (!password) return errorHandler(res, 403, "Password Required.");

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
            response.message = "Incorrect Username Or Password! Please Contect to Adminitrator.";
            response.body = {};
        };
    } catch (error) {
        console.log(`Something went wrong: controller: signin: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: signin`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.forgotPassword = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: forgotPassword: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: forgotPassword`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.resetPassword = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: resetPassword: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: resetPassword`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.viewProfile = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: viewProfile: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: viewProfile`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};