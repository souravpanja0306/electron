const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        license_key: { type: String, required: true, unique: true, index: true },
        machine_id: { type: String, required: true, unique: true, index: true },
        plan: { type: String, enum: ["FREE", "PRO", "ENTERPRISE"], default: "FREE" },
        max_devices: { type: Number, default: 1 },
        start_date: { type: Date, required: true },
        expiry_date: { type: Date, required: true },
        is_active: { type: Boolean, default: true },
        grace_days: { type: Number, default: 3 }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("license", licenseSchema, "license");