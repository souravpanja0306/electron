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

module.exports.checkUsername = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { username } = req.params;
        if (!username) return errorHandler(res, 400, "Username Required.");

        let isUsernameExist = await UserService.findUsersInMongodb({ username: username });
        if (isUsernameExist.length) {
            response.status = 409;
            response.message = "Username already taken, try another.";
            response.body = { exists: true };
        } else {
            response.status = 200;
            response.message = "Username is available.";
            response.body = { exists: false };
        };
    } catch (error) {
        console.log(`Something went wrong: controller: checkUsername: ${error}`);
        response.status = 500;
        response.message = "Internal Server Error";
    };
    return res.status(response.status).json(response);
};

module.exports.signup = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { name, mobile, email, username, password, machineId } = req.body;

        if (!name) return errorHandler(res, 400, "name Required.");
        if (!mobile) return errorHandler(res, 400, "mobile Required.");
        if (!email) return errorHandler(res, 400, "email Required.");
        if (!username) return errorHandler(res, 400, "username Required.");
        if (!password) return errorHandler(res, 400, "Password Required.");
        if (!machineId) return errorHandler(res, 400, "machineId Required.");

        let isMachineIdExist = await UserService.findUsersInMongodb({ machine_id: machineId });
        if (isMachineIdExist.length) return errorHandler(res, 409, "This Machine is already registered. You cannot create new account with this machine.");

        let isEmailExist = await UserService.findUsersInMongodb({ email: email });
        if (isEmailExist.length) return errorHandler(res, 409, "Email is already registered.");

        let isMobileExist = await UserService.findUsersInMongodb({ mobile: mobile });
        if (isMobileExist.length) return errorHandler(res, 409, "Mobile is already registered.");

        let isUsernameExist = await UserService.findUsersInMongodb({ username: username });
        if (isUsernameExist.length) return errorHandler(res, 409, "Username already taken, try another.");

        let license_key = generateLicenseKey();
        let newData = {
            name: name,
            mobile: mobile,
            email: email,
            username: username,
            password: password,
            machine_id: machineId,
            license_key: license_key,
        };
        let mongoResult = await UserService.insertUsersInMongodb(newData);
        if (mongoResult) {
            // Create FREE 1 year license
            const startDate = new Date();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            let newLicenseData = {
                license_key: license_key,
                machine_id: machineId ? machineId : "",
                user_id: mongoResult.id ? mongoResult.id : "",
                plan: "FREE",
                max_devices: 1,
                start_date: startDate,
                expiry_date: expiryDate,
                is_active: true
            };
            let licenseData = await LicenseService.createLicense(newLicenseData);
            if (licenseData) {

                let result = await UserService.insertUsers(newData);
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
        } else {
            response.status = 202;
            response.message = "Something went wrong, please try again.";
            response.body = {
                license_key: "",
                name: "",
                id: "",
                token: "",
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

module.exports.signin = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { username, password, machineId } = req.body;
        if (!username) return errorHandler(res, 400, "Username Required.");
        if (!password) return errorHandler(res, 400, "Password Required.");
        if (!machineId) return errorHandler(res, 400, "Machine ID Required.");

        let getUserDetails = await UserService.getUsers({
            password: password,
            username: username,
        });
        if (getUserDetails.length) {
            let findMongoUser = await UserService.findUsersInMongodb({
                username: username,
                machine_id: machineId
            });
            if (!findMongoUser.length) {
                response.status = 202;
                response.message = "This is different machine. You cannot login here.";
                response.body = {};
                return res.status(response.status).json(response);
            };
            await UserService.updateUsersInMongodb({
                search_key: {
                    username: username,
                },
                update_info: {
                    last_activity: new Date(),
                    machine_id: machineId
                }
            });

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
            response.status = 202;
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

module.exports.forgotPassword = async (req, res) => {
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

module.exports.resetPassword = async (req, res) => {
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

module.exports.viewProfile = async (req, res) => {
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