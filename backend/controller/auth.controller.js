// Package...
const crypto = require("crypto");
const mongoose = require("mongoose");

// Services / helpers...
const UserService = require("../service/user.service");
const LicenseService = require("../service/license.service");
const { errorHandler, ok, str, serverError } = require("../helper/http");
const { hashPassword, verifyPassword, needsRehash } = require("../helper/password");
const { signUserToken } = require("../helper/authToken");

const OFFLINE_MESSAGE = "Can't reach the MyERP licence server. Check your internet connection and try again.";

const generateLicenseKey = () => crypto.randomBytes(16).toString("hex").match(/.{1,4}/g).join("-").toUpperCase();

// Mongo errors while offline / timing out read better as a single clear message.
const isOfflineError = (error) => /buffering timed out|ECONNREFUSED|ENOTFOUND|Server selection timed out|MongoNetworkError/i.test(String(error?.message || error));

module.exports.checkUsername = async (req, res) => {
    try {
        const username = str(req.params.username);
        if (!username) return errorHandler(res, 400, "Username Required.");

        const existing = await UserService.findUsersInMongodb({ username });
        if (existing.length) return res.status(409).json({ status: 409, message: "Username already taken, try another.", body: { exists: true } });
        return ok(res, "Username is available.", { exists: false });
    } catch (error) {
        if (isOfflineError(error)) return errorHandler(res, 503, OFFLINE_MESSAGE);
        return serverError(res, "controller: checkUsername", error);
    };
};

module.exports.signup = async (req, res) => {
    try {
        const name = str(req.body.name);
        const mobile = str(req.body.mobile);
        const email = str(req.body.email).toLowerCase();
        const username = str(req.body.username);
        const password = typeof req.body.password === "string" ? req.body.password : "";
        const machineId = str(req.body.machineId);

        if (!name) return errorHandler(res, 400, "Name is required.");
        if (!/^[6-9]\d{9}$/.test(mobile)) return errorHandler(res, 400, "Enter a valid 10-digit mobile number.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return errorHandler(res, 400, "Enter a valid email address.");
        if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) return errorHandler(res, 400, "Username must be 3–30 letters, numbers, dots, dashes or underscores.");
        if (password.length < 8) return errorHandler(res, 400, "Password must be at least 8 characters.");
        if (!machineId) return errorHandler(res, 400, "Machine ID is required.");

        if ((await UserService.getUsers({ username })).length) return errorHandler(res, 409, "Username already taken, try another.");

        if ((await UserService.findUsersInMongodb({ machine_id: machineId })).length) return errorHandler(res, 409, "This Machine is already registered. You cannot create new account with this machine.");
        if ((await UserService.findUsersInMongodb({ email })).length) return errorHandler(res, 409, "Email is already registered.");
        if ((await UserService.findUsersInMongodb({ mobile })).length) return errorHandler(res, 409, "Mobile is already registered.");
        if ((await UserService.findUsersInMongodb({ username })).length) return errorHandler(res, 409, "Username already taken, try another.");

        const license_key = generateLicenseKey();
        const newData = {
            name,
            mobile,
            email,
            username,
            password: hashPassword(password),
            machine_id: machineId,
            license_key,
        };

        const mongoUser = await UserService.insertUsersInMongodb(newData);
        if (!mongoUser) return errorHandler(res, 500, "Could not create the account. Please try again.");

        // Free one-year licence.
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        let license;
        try {
            license = await LicenseService.createLicense({
                license_key,
                machine_id: machineId,
                user_id: mongoUser._id,
                plan: "FREE",
                max_devices: 1,
                start_date: startDate,
                expiry_date: expiryDate,
                is_active: true,
            });
        } catch (error) {
            // Don't leave an account behind that can never sign in.
            await UserService.deleteUserInMongodb({ _id: mongoUser._id }).catch(() => { });
            throw error;
        };

        const user = await UserService.insertUsers(newData);
        if (!user) {
            await LicenseService.deleteLicense({ license_key }).catch(() => { });
            await UserService.deleteUserInMongodb({ _id: mongoUser._id }).catch(() => { });
            return errorHandler(res, 500, "Could not save the account on this computer. Please try again.");
        };

        return ok(res, "Sign-up successful.", {
            license_key: license?.license_key || license_key,
            name: user.name,
            id: user.id,
            token: signUserToken(user),
        });
    } catch (error) {
        if (isOfflineError(error)) return errorHandler(res, 503, OFFLINE_MESSAGE);
        if (error?.code === 11000) return errorHandler(res, 409, "This account or machine is already registered.");
        return serverError(res, "controller: signup", error, "Could not create the account. Please try again.");
    };
};

module.exports.signin = async (req, res) => {
    try {
        const username = str(req.body.username);
        const password = typeof req.body.password === "string" ? req.body.password : "";
        const machineId = str(req.body.machineId);
        if (!username) return errorHandler(res, 400, "Username Required.");
        if (!password) return errorHandler(res, 400, "Password Required.");
        if (!machineId) return errorHandler(res, 400, "Machine ID Required.");

        const users = await UserService.getUsers({ username });
        const user = users?.[0];
        if (!user || user.is_deleted || !verifyPassword(password, user.password)) {
            return res.status(202).json({ status: 202, message: "Incorrect username Or password.", body: {} });
        };

        // The account is locked to the machine it was registered on.
        if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
            return errorHandler(res, 503, OFFLINE_MESSAGE);
        };
        const mongoUser = await UserService.findUsersInMongodb({ username, machine_id: machineId });
        if (!mongoUser.length) {
            return res.status(202).json({ status: 202, message: "This is different machine. You cannot login here.", body: {} });
        };

        // Old accounts stored the password as plain text: save it hashed from now on.
        const update = { last_activity: new Date() };
        if (needsRehash(user.password)) {
            const hashed = hashPassword(password);
            await UserService.updateUsers({ password: hashed }, user.id);
            update.password = hashed;
        };
        await UserService.updateUsersInMongodb({ search_key: { username, machine_id: machineId }, update_info: update });

        return ok(res, "Authentication successful.", {
            name: user.name,
            id: user.id,
            token: signUserToken(user),
        });
    } catch (error) {
        if (isOfflineError(error)) return errorHandler(res, 503, OFFLINE_MESSAGE);
        return serverError(res, "controller: signin", error, "Could not sign in. Please try again.");
    };
};
