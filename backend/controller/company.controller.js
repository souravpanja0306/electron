// Package...
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service");
const CompanyService = require("../service/company.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

module.exports.addCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let isMobileExist = await CompanyService.getCompany({ mobile: req.body.mobile, created_by: t_userId });
        if (isMobileExist.length) return errorHandler(res, 409, "Mobile number already registered.");

        let isEmailExist = await CompanyService.getCompany({ mobile: req.body.email, created_by: t_userId });
        if (isEmailExist.length) return errorHandler(res, 409, "Email Id already registered.");

        const companyFolder = app.isPackaged
            ? path.join(app.getPath("userData"), "uploads", "company")
            : path.join(__dirname, "../../uploads/company");
        if (!fs.existsSync(companyFolder)) fs.mkdirSync(companyFolder, { recursive: true });

        let finalData = {
            company_name: req.body.company_name,
            email: req.body.email,
            mobile: req.body.mobile,
            owner: req.body.owner,
            address_1: req.body.address_1,
            address_2: req.body.address_2,
            city: req.body.city,
            state: req.body.state,
            district: req.body.district,
            pincode: req.body.pincode,
            country: req.body.country,
            gst: req.body.gst,
            pan: req.body.pan,
            trade_licence: req.body.trade_licence,
            bank: req.body.bank,
            ifse: req.body.ifse,
            branch: req.body.branch,
            account_no: req.body.account_no,
            logo: "",
            created_by: t_userId,
        };
        if (req.file) {
            let oldpath = req.file.path;
            let file_date = moment().format("DD-MM-YYYY");
            let random_number = Math.floor(Math.random() * 10000000000 + 1);
            let fileName = `${random_number}_${file_date}_${req.file.originalname}`
            let filePath = path.join(companyFolder, fileName);

            fs.renameSync(oldpath, filePath, (err) => {
                if (err) console.log(err)
            });
            finalData["logo"] = fileName
        };


        let result = await CompanyService.createCompany(finalData);

        response.status = 200;
        response.message = "Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: addCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: addCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await CompanyService.getCompany(search_key);

        if (result.length) {
            result.map((item) => {
                item["logo"] = `http://localhost:3001/uploads/company/${item.logo}`;
            });
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getCompanyById = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await CompanyService.getCompany(search_key);

        if (result.length) {
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.removeCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { ids } = req.body;
        if (!ids) {
            response.status = 400;
            response.message = "IDs are required";
            response.body = [];
            return res.status(response.status).json(response);
        };

        let result = await CompanyService.deleteCompany({ ids: ids });

        if (result.changes > 0) {
            response.status = 200;
            response.message = "Data deleted succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: removeCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: removeCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.updateCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        if (!id) {
            response.status = 400;
            response.message = "Company ID is required";
            response.body = [];
            return res.status(response.status).json(response);
        };

        const updateData = {
            company_name: req.body.company_name ? req.body.company_name : "",
            email: req.body.email ? req.body.email : "",
            mobile: req.body.mobile ? req.body.mobile : "",
            owner: req.body.owner ? req.body.owner : "",
            address_1: req.body.address_1 ? req.body.address_1 : "",
            address_2: req.body.address_2 ? req.body.address_2 : "",
            city: req.body.city ? req.body.city : "",
            state: req.body.state ? req.body.state : "",
            district: req.body.district ? req.body.district : "",
            pincode: req.body.pincode ? req.body.pincode : "",
            country: req.body.country ? req.body.country : "INDIA",
            gst: req.body.gst ? req.body.gst : "",
            pan: req.body.pan ? req.body.pan : "",
            trade_licence: req.body.trade_licence ? req.body.trade_licence : "",
            bank: req.body.bank ? req.body.bank : "",
            ifse: req.body.ifse ? req.body.ifse : "",
            branch: req.body.branch ? req.body.branch : "",
            account_no: req.body.account_no ? req.body.account_no : "",
        };

        const companyFolder = app.isPackaged
            ? path.join(app.getPath("userData"), "uploads", "company")
            : path.join(__dirname, "../../uploads/company");
        if (!fs.existsSync(companyFolder)) fs.mkdirSync(companyFolder, { recursive: true });


        if (req.file) {
            let oldpath = req.file.path;
            let file_date = moment().format("DD-MM-YYYY");
            let random_number = Math.floor(Math.random() * 10000000000 + 1);
            let fileName = `${random_number}_${file_date}_${req.file.originalname}`
            let filePath = path.join(companyFolder, fileName);
            fs.renameSync(oldpath, filePath, (err) => {
                if (err) console.log(err)
            });
            updateData["logo"] = fileName;
        };

        let result = await CompanyService.updateCompany(id, updateData);

        if (result.changes > 0) {
            response.status = 200;
            response.message = "Company updated successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Company not found or no changes made.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: updateCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: updateCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};