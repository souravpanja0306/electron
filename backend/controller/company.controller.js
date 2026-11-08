// Services / helpers...
const CompanyService = require("../service/company.service");
const { errorHandler, ok, toId, serverError } = require("../helper/http");
const { pickBusiness, validateBusiness, countReferences, describeReferences } = require("../helper/business");
const { saveLogo, removeLogo, discardUpload } = require("../helper/upload");
const { uploadUrl } = require("../helper/html");

const withLogoUrl = (company) => ({ ...company, logo: uploadUrl("company", company.logo) });

// The company with this id, if it belongs to the signed-in user.
const findOwnCompany = async (id, userId) => (await CompanyService.getCompany({ id, created_by: userId }))[0] || null;

module.exports.addCompany = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const data = pickBusiness(req.body);
        const invalid = validateBusiness(data, "Company name");
        if (invalid) {
            discardUpload(req.file);
            return errorHandler(res, 400, invalid);
        };

        const finalData = { ...data, logo: "", created_by: t_userId };
        if (req.file) finalData.logo = saveLogo(req.file, "company");

        const result = await CompanyService.createCompany(finalData);
        return ok(res, "Company created successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        discardUpload(req.file);
        return serverError(res, "controller: addCompany", error, "Could not create the company.");
    };
};

module.exports.getCompany = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const search_key = { created_by: t_userId };
        if (req.query.id) {
            const id = toId(req.query.id);
            if (!id) return errorHandler(res, 400, "Invalid company ID.");
            search_key.id = id;
        };

        const result = await CompanyService.getCompany(search_key);
        if (!result.length) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });
        return ok(res, "Data fetched successfully.", result.map(withLogoUrl));
    } catch (error) {
        return serverError(res, "controller: getCompany", error, "Could not load companies.");
    };
};

module.exports.getCompanyById = async (req, res) => {
    try {
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "Invalid company ID.");
        const company = await findOwnCompany(id, req.body.t_userId);
        if (!company) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });
        return ok(res, "Data fetched successfully.", [withLogoUrl(company)]);
    } catch (error) {
        return serverError(res, "controller: getCompanyById", error, "Could not load the company.");
    };
};

/** Body: { ids: [1, 2] }. Only the user's own companies, and only ones no document uses. */
module.exports.removeCompany = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const raw = Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids];
        const ids = [...new Set(raw.map(toId).filter(Boolean))];
        if (!ids.length) return errorHandler(res, 400, "IDs are required.");

        const companies = [];
        for (const id of ids) {
            const company = await findOwnCompany(id, t_userId);
            if (!company) return errorHandler(res, 404, "Company not found.");
            const usedBy = describeReferences(countReferences("company", id));
            if (usedBy) return errorHandler(res, 409, `"${company.company_name}" is used on ${usedBy}. Delete those first, or keep the company.`);
            companies.push(company);
        };

        const result = await CompanyService.deleteCompany({ ids });
        companies.forEach((company) => removeLogo(company.logo, "company"));
        return ok(res, "Company deleted successfully.", result);
    } catch (error) {
        return serverError(res, "controller: removeCompany", error, "Could not delete the company.");
    };
};

module.exports.updateCompany = async (req, res) => {
    try {
        const id = toId(req.params.id);
        if (!id) {
            discardUpload(req.file);
            return errorHandler(res, 400, "Company ID is required.");
        };

        const company = await findOwnCompany(id, req.body.t_userId);
        if (!company) {
            discardUpload(req.file);
            return errorHandler(res, 404, "Company not found.");
        };

        const data = pickBusiness(req.body);
        const invalid = validateBusiness(data, "Company name");
        if (invalid) {
            discardUpload(req.file);
            return errorHandler(res, 400, invalid);
        };

        if (req.file) data.logo = saveLogo(req.file, "company");
        else if (req.body.remove_logo === "1") data.logo = "";

        const result = await CompanyService.updateCompany(id, data);
        if ("logo" in data && company.logo && company.logo !== data.logo) removeLogo(company.logo, "company");
        return ok(res, "Company updated successfully.", result);
    } catch (error) {
        discardUpload(req.file);
        return serverError(res, "controller: updateCompany", error, "Could not update the company.");
    };
};
