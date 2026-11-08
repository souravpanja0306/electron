// Services / helpers...
const SettingService = require("../service/setting.service");
const CompanyService = require("../service/company.service");
const contents = require("../content/contents");
const { errorHandler, str, toId } = require("../helper/http");

// Fields are shown unless explicitly switched off (older clients don't send the flag).
const toShowFlag = (value) => (value === false || value === 0 || value === "0" || value === "false" ? 0 : 1);

// The company id, if it belongs to the signed-in user.
const ownCompanyId = async (company_id, userId) => {
    const id = toId(company_id);
    if (!id) return null;
    const rows = await CompanyService.getCompany({ id, created_by: userId });
    return rows.length ? id : null;
};

const MAX_AFFIX = 20;

/** Body: { company_id, prefix, suffix, starting, terms, remarks } — one row per company. */
module.exports.addChallanSetting = async (req, res) => {
    try {
        const company_id = await ownCompanyId(req.body.company_id, req.body.t_userId);
        if (!company_id) return errorHandler(res, 400, "Please select a company.");

        const prefix = str(req.body.prefix);
        const suffix = str(req.body.suffix);
        const startingText = str(req.body.starting);
        const starting = startingText === "" ? 0 : Number(startingText);
        if (prefix.length > MAX_AFFIX || suffix.length > MAX_AFFIX) return errorHandler(res, 400, `Prefix and suffix can be up to ${MAX_AFFIX} characters.`);
        if (!Number.isInteger(starting) || starting < 0) return errorHandler(res, 400, "Starting number must be 0 or a whole number above 0.");

        const finalData = {
            company_id,
            prefix,
            suffix,
            starting,
            terms: str(req.body.terms),
            remarks: str(req.body.remarks),
        };
        const existing = await SettingService.getChallanSetting({ company_id });
        const result = existing.length
            ? await SettingService.updateChallanSetting({ id: existing[0].id, data: finalData })
            : await SettingService.createChallanSetting(finalData);
        return res.status(200).json({
            status: 200,
            message: existing.length ? "Challan setting updated successfully." : "Challan setting added successfully.",
            body: result,
        });
    } catch (error) {
        console.log(`Something went wrong: controller: addChallanSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
};

/** Query: company_id (optional). Without it, the settings of all the user's companies. */
module.exports.listChallanSetting = async (req, res) => {
    try {
        const { t_userId } = req.body;
        let result;
        if (req.query.company_id) {
            const company_id = await ownCompanyId(req.query.company_id, t_userId);
            if (!company_id) return errorHandler(res, 404, "Company not found.");
            result = await SettingService.getChallanSetting({ company_id });
        } else {
            const companies = await CompanyService.getCompany({ created_by: t_userId });
            const ids = new Set(companies.map((c) => c.id));
            result = (await SettingService.getChallanSetting({})).filter((row) => ids.has(row.company_id));
        };
        if (!result.length) return res.status(202).json({ status: 202, message: "No challan settings saved yet.", body: [] });
        return res.status(200).json({ status: 200, message: "Challan settings fetched successfully.", body: result });
    } catch (error) {
        console.log(`Something went wrong: controller: listChallanSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
};

module.exports.getTheme = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const theme = await SettingService.getUserTheme({ user_id: req.body.t_userId });
        response.status = 200;
        response.message = "Theme fetched successfully.";
        response.body = { theme: theme || "light" };
    } catch (error) {
        console.log(`Something went wrong: controller: getTheme: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.saveTheme = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, theme } = req.body;
        if (!["light", "dark"].includes(theme)) return errorHandler(res, 400, "Theme must be 'light' or 'dark'.");

        await SettingService.saveUserTheme({ user_id: t_userId, theme });
        response.status = 200;
        response.message = "Theme saved successfully.";
        response.body = { theme };
    } catch (error) {
        console.log(`Something went wrong: controller: saveTheme: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

// Field visibility shared by Create Invoice and Create Challan (currently: CHA).
module.exports.getFieldSettings = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const showCha = await SettingService.getUserShowCha({ user_id: req.body.t_userId });
        response.status = 200;
        response.message = "Field settings fetched successfully.";
        response.body = { show_cha: showCha ? 1 : 0 };
    } catch (error) {
        console.log(`Something went wrong: controller: getFieldSettings: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.saveFieldSettings = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, show_cha } = req.body;
        const value = toShowFlag(show_cha);
        await SettingService.saveUserShowCha({ user_id: t_userId, show_cha: value });
        response.status = 200;
        response.message = "Field settings saved successfully.";
        response.body = { show_cha: value };
    } catch (error) {
        console.log(`Something went wrong: controller: saveFieldSettings: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.saveInvoiceSetting = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const company_id = await ownCompanyId(req.body.company_id, req.body.t_userId);
        if (!company_id) return errorHandler(res, 400, "Please select a company.");

        const invoice_prefix = str(req.body.invoice_prefix) || "INV-";
        const invoice_suffix = str(req.body.invoice_suffix);
        const start = Number(str(req.body.invoice_start_number) || 1);
        if (invoice_prefix.length > MAX_AFFIX || invoice_suffix.length > MAX_AFFIX) return errorHandler(res, 400, `Prefix and suffix can be up to ${MAX_AFFIX} characters.`);
        if (!Number.isInteger(start) || start < 1) return errorHandler(res, 400, "Start number must be a whole number, 1 or higher.");

        const data = {
            company_id,
            invoice_prefix,
            invoice_suffix,
            invoice_start_number: start,
            terms_and_conditions: str(req.body.terms_and_conditions),
        };
        const existing = await SettingService.getInvoiceSetting({ company_id: data.company_id });
        const result = existing.length
            ? await SettingService.updateInvoiceSetting({ id: existing[0].id, data })
            : await SettingService.createInvoiceSetting(data);

        response.status = 200;
        response.message = existing.length ? "Invoice settings updated successfully." : "Invoice settings saved successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: saveInvoiceSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.listInvoiceSetting = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        if (!req.query.company_id) return errorHandler(res, 400, "Company is required.");
        const company_id = await ownCompanyId(req.query.company_id, req.body.t_userId);
        if (!company_id) return errorHandler(res, 404, "Company not found.");
        const result = await SettingService.getInvoiceSetting({ company_id });
        response.status = 200;
        response.message = "Invoice settings fetched successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: listInvoiceSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};
