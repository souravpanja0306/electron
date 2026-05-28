const moment = require("moment");
const fs = require('fs');
const puppeteer = require("puppeteer");
const contents = require("../content/contents");
const ChallanService = require("../service/challan.service");
const PartyService = require("../service/party.service");
const CompanyService = require("../service/company.service");
const { generateChallanHtml } = require("../helper/generateChallanHtml");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.generateChallanPdf = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.query;
        if (!id) return errorHandler(res, 400, "Challan ID is required.");

        let challans = await ChallanService.findChallans({ id });
        if (!challans.length) return errorHandler(res, 404, "Challan not found.");
        let challan = challans[0];

        // Hydrate relations
        let consignor = await PartyService.getParty({ id: challan.consignor_id });
        let consignee = await PartyService.getParty({ id: challan.consignee_id });
        challan.consignor_id = consignor.length ? consignor[0] : null;
        challan.consignee_id = consignee.length ? consignee[0] : null;
        challan.data = challan.data ? JSON.parse(challan.data) : [];

        // Get company
        let companies = await CompanyService.getCompany({});
        let company = companies.length ? companies[0] : {};

        const html = generateChallanHtml({ challan, company });

        let folder = "./uploads/challan_pdf/";
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const fileName = `CHALLAN_${challan.cn_no || challan.id}_${moment().format("DDMMYYYY")}.pdf`;
        const filePath = `${folder}${fileName}`;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.pdf({
            path: filePath,
            format: "A4",
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        await browser.close();

        response.status = 200;
        response.message = "PDF generated successfully.";
        response.body = {
            fileName: fileName,
            url: `http://localhost:3001/uploads/challan_pdf/${fileName}`
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateChallanPdf: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: generateChallanPdf";
    }
    return res.status(response.status).json(response);
};

exports.createChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, consignor_id, consignee_id, cn_no, date, from_loc, to_loc,
            invoice_no, way_bill_no, truck_no, note, data
        } = req.body;

        if (!consignor_id || !consignee_id) return errorHandler(res, 400, "Consignor and Consignee are required.");

        if (cn_no) {
            let isCnExist = await ChallanService.findChallans({ cn_no: cn_no });
            if (isCnExist.length) return errorHandler(res, 409, "C/N Number Already Exists.");
        }

        let finalData = {
            consignor_id,
            consignee_id,
            cn_no,
            date,
            from_loc,
            to_loc,
            invoice_no,
            way_bill_no,
            truck_no,
            note,
            created_by: t_userId,
            data: JSON.stringify(data)
        };

        let result = await ChallanService.insertChallanData(finalData);

        response.status = 200;
        response.message = "Challan created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: createChallan: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: createChallan";
    }
    return res.status(response.status).json(response);
};

exports.getAllChallans = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        // Optional: filter by user if required, usually admin can see all
        // if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await ChallanService.findChallans(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let consignor = await PartyService.getParty({ id: item.consignor_id });
                let consignee = await PartyService.getParty({ id: item.consignee_id });

                let newData = {
                    id: item.id,
                    consignor_id: consignor.length ? consignor[0] : null,
                    consignee_id: consignee.length ? consignee[0] : null,
                    cn_no: item.cn_no || "--",
                    date: item.date || "--",
                    from_loc: item.from_loc || "--",
                    to_loc: item.to_loc || "--",
                    invoice_no: item.invoice_no || "--",
                    way_bill_no: item.way_bill_no || "--",
                    truck_no: item.truck_no || "--",
                    note: item.note || "--",
                    data: item.data ? JSON.parse(item.data) : [],
                    created_by: item.created_by,
                    created_at: item.created_at,
                    is_active: item.is_active,
                    is_deleted: item.is_deleted
                };
                finalData.push(newData);
            }
            response.status = 200;
            response.message = "Data fetched successfully.";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        }
    } catch (error) {
        console.log(`Something went wrong: controller: getAllChallans: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: getAllChallans";
    }
    return res.status(response.status).json(response);
};

exports.deleteChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        let result = await ChallanService.deleteChallan({ id });
        if (result.deleted) {
            response.status = 200;
            response.message = "Challan deleted successfully.";
        } else {
            response.status = 202;
            response.message = "Something went wrong!";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: deleteChallan: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: deleteChallan";
    }
    return res.status(response.status).json(response);
};