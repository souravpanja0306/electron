// Package...
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Services / helpers...
const AdminService = require("../service/admin.service");
const { str, toId, round2, ok, serverError } = require("../helper/http");

// DB Connection...
const { dbPath, pendingRestorePath } = require("../database/connection");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

const os = require("os");

// Backup / restore / reset. All routes are behind isAuthenticated (see admin.routes.js).

/** Streams a consistent snapshot of the database as a dated .db file. */
module.exports.dumpDB = async (req, res) => {
    const tempFile = path.join(os.tmpdir(), `myerp-backup-${Date.now()}.db`);
    try {
        if (!fs.existsSync(dbPath)) return errorHandler(res, 404, "Database file not found.");
        await AdminService.backupDatabase(tempFile);
        const fileName = `myerp-backup-${moment().format("YYYY-MM-DD_HHmm")}.db`;
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        return res.download(tempFile, fileName, (error) => {
            fs.unlink(tempFile, () => { });
            if (error) console.log(`Something went wrong: controller: dumpDB: download: ${error}`);
        });
    } catch (error) {
        fs.unlink(tempFile, () => { });
        console.log(`Something went wrong: controller: dumpDB: ${error}`);
        return errorHandler(res, 500, "Could not create the backup.");
    };
};

/**
 * Verifies an uploaded backup, stages it, and restarts the app. The swap happens on the
 * next start (database/connection.js), which also keeps a copy of the current database.
 */
module.exports.restoreDB = async (req, res) => {
    const uploaded = req.file?.path;
    try {
        if (!uploaded) return errorHandler(res, 400, "Please choose a backup file.");
        AdminService.verifyBackupFile(uploaded);
        fs.copyFileSync(uploaded, pendingRestorePath);
        fs.unlink(uploaded, () => { });

        res.on("finish", () => setTimeout(() => {
            app.relaunch();
            app.exit(0);
        }, 800));
        return res.status(200).json({
            status: 200,
            message: "Backup verified. MyERP will restart to finish the restore.",
            body: [],
        });
    } catch (error) {
        if (uploaded) fs.unlink(uploaded, () => { });
        console.log(`Something went wrong: controller: restoreDB: ${error}`);
        return errorHandler(res, error.status || 500, error.status ? error.message : "Could not restore the backup.");
    };
};

/** Deletes business data. Body: { scope: "transactions" | "all", confirm: "DELETE" }. */
module.exports.resetData = async (req, res) => {
    try {
        const { scope, confirm } = req.body || {};
        if (confirm !== "DELETE") return errorHandler(res, 400, "Type DELETE to confirm.");
        if (!AdminService.RESET_SCOPES[scope]) return errorHandler(res, 400, "Unknown reset scope.");

        const deleted = AdminService.resetBusinessData({ scope });
        const total = Object.values(deleted).reduce((sum, n) => sum + n, 0);
        return res.status(200).json({
            status: 200,
            message: `Deleted ${total} record${total === 1 ? "" : "s"}.`,
            body: deleted,
        });
    } catch (error) {
        console.log(`Something went wrong: controller: resetData: ${error}`);
        return errorHandler(res, error.status || 500, error.status ? error.message : "Could not reset the data.");
    };
};

/** Record counts per table, for the Database settings page. */
module.exports.dataSummary = async (req, res) => {
    try {
        return res.status(200).json({ status: 200, message: "OK", body: AdminService.getDataSummary() });
    } catch (error) {
        console.log(`Something went wrong: controller: dataSummary: ${error}`);
        return errorHandler(res, 500, "Could not read the database.");
    };
};

/* ------------------------------ HSN / SAC master ----------------------------- */

const HSN_TYPES = ["HSN", "SAC"];

/** Validates an HSN/SAC body. Returns { error } or { data }. */
const prepareHsn = (body) => {
    const code = str(body.code).toUpperCase();
    const type = str(body.type).toUpperCase() || "HSN";
    const rateText = str(body.gst_rate);
    const gst_rate = rateText === "" ? 0 : Number(rateText);
    if (!code) return { error: "Code is required." };
    if (!/^[0-9A-Z]{2,10}$/.test(code)) return { error: "Code must be 2 to 10 letters or digits." };
    if (!HSN_TYPES.includes(type)) return { error: "Type must be HSN or SAC." };
    if (!(gst_rate >= 0 && gst_rate <= 100)) return { error: "GST rate must be between 0 and 100." };
    return { data: { code, type, description: str(body.description), gst_rate } };
};

const formatCreated = (value) => (value ? moment(value, "YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY") : "");

module.exports.createHsnSac = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const prepared = prepareHsn(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const existing = await AdminService.findHSNSAC({ created_by: t_userId, code: prepared.data.code, type: prepared.data.type });
        if (existing.length) return errorHandler(res, 409, `${prepared.data.type} ${prepared.data.code} already exists.`);

        const result = await AdminService.createHSNSAC({ ...prepared.data, created_by: t_userId });
        return ok(res, "Data Created Successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createHsnSac", error, "Could not save the HSN/SAC code.");
    };
};

module.exports.getHsnSac = async (req, res) => {
    try {
        const result = await AdminService.findHSNSAC({ created_by: req.body.t_userId });
        if (!result.length) return res.status(202).json({ status: 202, message: "No Data Found.", body: [] });
        return ok(res, "HSN - SAC Get Sucessfully", result.map((item) => ({
            id: item.id,
            code: item.code,
            type: item.type,
            description: item.description,
            gst_rate: item.gst_rate,
            created_at: formatCreated(item.created_at),
            is_active: item.is_active,
            is_deleted: item.is_deleted,
        })));
    } catch (error) {
        return serverError(res, "controller: getHsnSac", error, "Could not load HSN/SAC codes.");
    };
};

module.exports.updateHsnSac = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.body.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const prepared = prepareHsn(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const same = await AdminService.findHSNSAC({ created_by: t_userId, code: prepared.data.code, type: prepared.data.type });
        if (same.some((item) => item.id !== id)) return errorHandler(res, 409, `${prepared.data.type} ${prepared.data.code} already exists.`);

        const result = await AdminService.updateHSNSAC(id, prepared.data, t_userId);
        if (!result.changes) return errorHandler(res, 404, "HSN/SAC code not found.");
        return ok(res, "Data Updated Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: updateHsnSac", error, "Could not update the HSN/SAC code.");
    };
};

module.exports.deleteHsnSac = async (req, res) => {
    try {
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const result = await AdminService.deleteHSNSAC(id, req.body.t_userId);
        if (!result.changes) return errorHandler(res, 404, "HSN/SAC code not found.");
        return ok(res, "Data Deleted Successfully.");
    } catch (error) {
        return serverError(res, "controller: deleteHsnSac", error, "Could not delete the HSN/SAC code.");
    };
};

/* --------------------------------- GST master -------------------------------- */

/**
 * Validates a GST body. CGST / SGST default to half the rate and IGST to the full rate,
 * so a slab can be saved with just a title and a rate.
 */
const prepareGst = (body) => {
    const title = str(body.title);
    const type = str(body.type) || "percentage";
    if (!["percentage", "fixed"].includes(type)) return { error: "Type must be percentage or fixed." };
    // A percentage can't exceed 100; a fixed amount can be any non-negative value.
    const max = type === "percentage" ? 100 : Infinity;
    const inRange = (n) => Number.isFinite(n) && n >= 0 && n <= max;

    const total_rate = Number(str(body.total_rate));
    if (!str(body.total_rate) || !inRange(total_rate)) return { error: type === "percentage" ? "GST rate must be between 0 and 100." : "Enter a valid amount." };
    const part = (value, fallback) => (str(value) === "" ? fallback : Number(str(value)));
    const cgst = part(body.cgst, round2(total_rate / 2));
    const sgst = part(body.sgst, round2(total_rate / 2));
    const igst = part(body.igst, total_rate);
    if (![cgst, sgst, igst].every(inRange)) return { error: "CGST, SGST and IGST must be valid, non-negative values." };
    const unit = type === "percentage" ? "%" : "";
    return { data: { title: title || `GST ${total_rate}${unit}`, total_rate, cgst, sgst, igst, type } };
};

module.exports.createGST = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const prepared = prepareGst(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const existing = await AdminService.findGST({ created_by: t_userId, total_rate: prepared.data.total_rate });
        if (existing.length) return errorHandler(res, 409, `A ${prepared.data.total_rate}% GST rate already exists.`);

        const result = await AdminService.createGST({ ...prepared.data, created_by: t_userId });
        return ok(res, "Data Created Successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createGST", error, "Could not save the GST rate.");
    };
};

module.exports.getGST = async (req, res) => {
    try {
        const result = await AdminService.findGST({ created_by: req.body.t_userId });
        if (!result.length) return res.status(202).json({ status: 202, message: "No Data Found.", body: [] });
        return ok(res, "GST Get Sucessfully", result.map((item) => ({
            id: item.id,
            title: item.title || "",
            total_rate: item.total_rate,
            cgst: item.cgst,
            sgst: item.sgst,
            igst: item.igst,
            type: item.type || "",
            created_at: formatCreated(item.created_at),
            is_active: item.is_active,
            is_deleted: item.is_deleted,
        })));
    } catch (error) {
        return serverError(res, "controller: getGST", error, "Could not load GST rates.");
    };
};

module.exports.updateGST = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.body.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const prepared = prepareGst(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const same = await AdminService.findGST({ created_by: t_userId, total_rate: prepared.data.total_rate });
        if (same.some((item) => item.id !== id)) return errorHandler(res, 409, `A ${prepared.data.total_rate}% GST rate already exists.`);

        const result = await AdminService.updateGST(id, prepared.data, t_userId);
        if (!result.changes) return errorHandler(res, 404, "GST rate not found.");
        return ok(res, "Data Updated Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: updateGST", error, "Could not update the GST rate.");
    };
};

module.exports.deleteGST = async (req, res) => {
    try {
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const result = await AdminService.deleteGST(id, req.body.t_userId);
        if (!result.changes) return errorHandler(res, 404, "GST rate not found.");
        return ok(res, "Data Deleted Successfully.");
    } catch (error) {
        return serverError(res, "controller: deleteGST", error, "Could not delete the GST rate.");
    };
};

/* --------------------------------- CHA master -------------------------------- */

const prepareCha = (body) => {
    const name = str(body.name);
    const mobile = str(body.mobile);
    if (!name) return { error: "CHA Name is required." };
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) return { error: "Enter a valid 10-digit mobile number." };
    return { data: { name, mobile, address: str(body.address) } };
};

module.exports.createCHA = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const prepared = prepareCha(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const existing = await AdminService.findCHA({ created_by: t_userId, exact_name: prepared.data.name });
        if (existing.length) return errorHandler(res, 409, "This CHA is Already Created.");

        const result = await AdminService.createCHA({ ...prepared.data, created_by: t_userId });
        return ok(res, "CHA Created Successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createCHA", error, "Could not save the CHA.");
    };
};

module.exports.getCHA = async (req, res) => {
    try {
        const result = await AdminService.findCHA({ created_by: req.body.t_userId });
        if (!result.length) return res.status(202).json({ status: 202, message: "No Data Found.", body: [] });
        return ok(res, "CHA Get Successfully", result.map((item) => ({
            id: item.id,
            name: item.name,
            mobile: item.mobile,
            address: item.address,
            created_at: formatCreated(item.created_at),
            is_active: item.is_active,
            is_deleted: item.is_deleted,
        })));
    } catch (error) {
        return serverError(res, "controller: getCHA", error, "Could not load CHAs.");
    };
};

module.exports.updateCHA = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.body.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const prepared = prepareCha(req.body);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        const same = await AdminService.findCHA({ created_by: t_userId, exact_name: prepared.data.name });
        if (same.some((item) => item.id !== id)) return errorHandler(res, 409, "This CHA is Already Created.");

        const result = await AdminService.updateCHA(id, prepared.data, t_userId);
        if (!result.changes) return errorHandler(res, 404, "CHA not found.");
        return ok(res, "CHA Updated Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: updateCHA", error, "Could not update the CHA.");
    };
};

module.exports.deleteCHA = async (req, res) => {
    try {
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "ID is required.");
        const result = await AdminService.deleteCHA(id, req.body.t_userId);
        if (!result.changes) return errorHandler(res, 404, "CHA not found.");
        return ok(res, "CHA Deleted Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: deleteCHA", error, "Could not delete the CHA.");
    };
};
