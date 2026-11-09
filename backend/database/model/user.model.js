const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        machine_id: { type: String, required: true, unique: true, index: true },
        license_key: { type: String, required: true, unique: true, index: true },
        last_activity: { type: Date, default: Date.now },
        // Admin lock: set is_locked to true to block this account on every device.
        is_locked: { type: Boolean, default: false },
        lock_reason: { type: String, default: "" },
        locked_at: { type: Date, default: null }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("user", userSchema, "users");
