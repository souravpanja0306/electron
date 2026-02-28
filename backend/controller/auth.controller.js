// Package...
const moment = require("moment");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");

// Contents...
const contents = require("../content/contents");

// Services...
const UserService = require("../service/user.service");
const AdminService = require("../service/admin.service")
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");
const LicenseService = require("../service/license.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

const generateLicenseKey = () => {
    return crypto.randomBytes(16).toString("hex").match(/.{1,4}/g).join("-").toUpperCase();
};

exports.signup = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { name, mobile, email, username, password, machineId } = req.body;
        if (!name) return errorHandler(res, 400, "name Required.");
        if (!mobile) return errorHandler(res, 400, "mobile Required.");
        if (!email) return errorHandler(res, 400, "email Required.");
        if (!username) return errorHandler(res, 400, "username Required.");
        if (!password) return errorHandler(res, 400, "Password Required.");
        if (!machineId) return errorHandler(res, 400, "machineId Required.");

        let isMachineIdExist = await UserService.getUsers({ machine_id: machineId });
        if (isMachineIdExist.length) return errorHandler(res, 409, "This Machine is already registered.");

        let isEmailExist = await UserService.getUsers({ email: email });
        if (isEmailExist.length) return errorHandler(res, 409, "Email is already registered.");

        let isMobileExist = await UserService.getUsers({ mobile: mobile });
        if (isMobileExist.length) return errorHandler(res, 409, "Mobile is already registered.");

        let isUsernameExist = await UserService.getUsers({ username: username });
        if (isUsernameExist.length) return errorHandler(res, 409, "Username already taken, try another.");

        let newData = {
            name: name,
            mobile: mobile,
            email: email,
            username: username,
            password: password,
            machine_id: machineId,
        };
        let result = await UserService.insertUsers(newData);
        if (result) {

            // Create FREE 1 year license
            const startDate = new Date();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            let newLicenseData = {
                license_key: generateLicenseKey(),
                machine_id: machineId ? machineId : "",
                user_id: result.id ? result.id : "",
                plan: "FREE",
                max_devices: 1,
                start_date: startDate,
                expiry_date: expiryDate,
                is_active: true
            };
            let licenseData = await LicenseService.createLicense(newLicenseData);

            let tokenData = {
                TOKEN_UID: result.id,
                TOKEN_MOBILE: result.mobile,
                TONEN_USERNAME: result.username,
                TONEN_NAME: result.name,
            };
            let token = jwt.sign(tokenData, "secretOrPrivateKey");

            response.status = 200;
            response.message = "Sign-up successful.";
            response.body = {
                license_key: licenseData && licenseData.license_key ? licenseData.license_key : "",
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
        if (!username) return errorHandler(res, 400, "Username Required.");
        if (!password) return errorHandler(res, 400, "Password Required.");

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
            response.message = "Authentication successful.";
            response.body = {
                name: getUserDetails[0].name,
                id: getUserDetails[0].id,
                token: token,
            };
        } else {
            response.status = 401;
            response.message = "Incorrect username Or password.";
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