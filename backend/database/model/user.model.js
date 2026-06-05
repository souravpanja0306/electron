const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        machine_id: { type: String, required: true },
        last_activity: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("user", userSchema, "users");
