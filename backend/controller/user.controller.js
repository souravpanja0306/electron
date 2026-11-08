// Package...
const mongoose = require("mongoose");

// Services / helpers...
const UserService = require("../service/user.service");
const LicenseModel = require("../database/model/license.model");
const { errorHandler, str } = require("../helper/http");
const { hashPassword, verifyPassword } = require("../helper/password");

// Fields a user may change on their own profile. Everything else (username, password,
// machine_id, license_key, flags) is managed by the server.
const PROFILE_FIELDS = [
    "name", "mobile", "email",
    "address_1", "address_2", "city", "district", "state", "pincode", "country",
    "gst", "pan", "trade_licence",
    "bank", "branch", "ifse", "account_no",
];

// Never send secrets or device identifiers to the screen.
const publicProfile = (user) => {
    const { password, machine_id, is_deleted, ...rest } = user;
    return {
        ...rest,
        license_key: user.license_key ? `${"•".repeat(4)}-${String(user.license_key).slice(-4)}` : "",
    };
};

const PROFILE_RULES = {
    name: (v) => (String(v || "").trim() ? "" : "Name is required."),
    mobile: (v) => (!v || /^[6-9]\d{9}$/.test(v) ? "" : "Enter a valid 10-digit mobile number."),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address."),
    pincode: (v) => (!v || /^[1-9]\d{5}$/.test(v) ? "" : "Pincode must be 6 digits."),
    pan: (v) => (!v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? "" : "PAN format is AAAAA9999A."),
    ifse: (v) => (!v || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? "" : "IFSC format is ABCD0123456."),
    gst: (v) => (!v || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v) ? "" : "GSTIN must be 15 characters."),
};

module.exports.getProfile = async (req, res) => {
    try {
        const result = await UserService.getUsers({ id: req.body.t_userId });
        if (!result.length) return errorHandler(res, 404, "User not found.");
        return res.status(200).json({ status: 200, message: "Profile fetched successfully.", body: publicProfile(result[0]) });
    } catch (error) {
        console.log(`Something went wrong: controller: getProfile: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
};

module.exports.updateProfile = async (req, res) => {
    try {
        const id = req.body.t_userId;
        const updateData = {};
        for (const field of PROFILE_FIELDS) {
            if (req.body[field] === undefined) continue;
            let value = str(req.body[field]);
            if (["gst", "pan", "ifse"].includes(field)) value = value.toUpperCase();
            updateData[field] = value;
        };
        for (const [field, rule] of Object.entries(PROFILE_RULES)) {
            if (!(field in updateData) && field !== "name") continue;
            const message = rule(field in updateData ? updateData[field] : "x");
            if (message) return errorHandler(res, 400, message);
        };

        const updated = await UserService.updateUsers(updateData, id);
        if (!updated) return errorHandler(res, 400, "Failed to update profile.");

        const result = await UserService.getUsers({ id });
        return res.status(200).json({
            status: 200,
            message: "Profile updated successfully.",
            body: result.length ? publicProfile(result[0]) : {},
        });
    } catch (error) {
        console.log(`Something went wrong: controller: updateProfile: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
};

/** Body: { current_password, new_password }. Verifies the current password first. */
module.exports.changePassword = async (req, res) => {
    try {
        const id = req.body.t_userId;
        const current = typeof req.body.current_password === "string" ? req.body.current_password : "";
        const next = typeof req.body.new_password === "string" ? req.body.new_password : "";
        if (!current) return errorHandler(res, 400, "Enter your current password.");
        if (next.length < 8) return errorHandler(res, 400, "New password must be at least 8 characters.");
        if (next === current) return errorHandler(res, 400, "New password must be different from the current one.");

        const users = await UserService.getUsers({ id });
        const user = users[0];
        if (!user || !verifyPassword(current, user.password)) return errorHandler(res, 400, "Current password is incorrect.");

        const hashed = hashPassword(next);
        await UserService.updateUsers({ password: hashed }, id);

        // Keep the online account record in step (best effort: it is checked again at sign-in).
        if (mongoose.connection.readyState === 1) {
            await UserService.updateUsersInMongodb({
                search_key: { username: user.username },
                update_info: { password: hashed },
            }).catch((error) => console.log(`changePassword: online update skipped: ${error}`));
        };
        return res.status(200).json({ status: 200, message: "Password changed.", body: [] });
    } catch (error) {
        console.log(`Something went wrong: controller: changePassword: ${error}`);
        return errorHandler(res, 500, "Could not change the password.");
    };
};

/** Plan and validity of the signed-in user's licence (stored online). */
module.exports.getLicense = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return errorHandler(res, 503, "Licence details are unavailable offline.");
        const users = await UserService.getUsers({ id: req.body.t_userId });
        const key = users[0]?.license_key;
        if (!key) return errorHandler(res, 404, "No licence found for this account.");

        const license = await LicenseModel.findOne({ license_key: key }).lean().maxTimeMS(5000);
        if (!license) return errorHandler(res, 404, "No licence found for this account.");

        const expiry = new Date(license.expiry_date);
        const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
        return res.status(200).json({
            status: 200,
            message: "OK",
            body: {
                plan: license.plan,
                is_active: Boolean(license.is_active),
                start_date: license.start_date,
                expiry_date: license.expiry_date,
                days_left: daysLeft,
                max_devices: license.max_devices,
                license_key: `${"•".repeat(4)}-${String(key).slice(-4)}`,
            },
        });
    } catch (error) {
        console.log(`Something went wrong: controller: getLicense: ${error}`);
        return errorHandler(res, 500, "Could not load licence details.");
    };
};
