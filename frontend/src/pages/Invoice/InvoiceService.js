import axios from "axios";
import { baseURL } from "../../utils/baseUrl";
const token = localStorage.getItem("token");

export const handleSubmit = async (data) => {
    try {
        let result = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: `${baseURL.invoice}invoice-create`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(data),
        });
        return result.data;
    } catch (error) {
        console.log(error);
    };
};

export const handleGenerateInvoiceNo = async () => {
    try {
        let result = await axios.request({
            method: 'get',
            maxBodyLength: Infinity,
            url: `${baseURL.invoice}generate-invoice-no?types=invoice`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (result.data.status === 200) {
            return result.data.body;
        };
    } catch (error) {
        console.log(error);
    };
};

export const handleGetParty = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/party/party-list",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};

export const handleGetGST = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/admin/get-all-gst",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};

export const handleGetHsnSac = async () => {
    let result = await axios({
        method: "get",
        url: "http://localhost:3001/api/v1/admin/get-hsn-code",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return result.data;
};

export const handleGetAllInvoice = async ({
    id = ""
}) => {
    try {
        let queries = `?`;
        if (id) queries += `id=${id}`;

        let result = await axios({
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://localhost:3001/api/v1/invoice/invoice-list${queries}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (result.data.status === 200) {
            return result.data.body;
        };
    } catch (error) {
        console.log(error);
    };
};

export const handleDeleteParty = async ({

}) => {
    try {
        if (!window.api) return;

        let res = await window.api.getParty({});
        if (res.body.length) {
            res.body.map(item => item.is_selected = false)
        };
        return res.body;
    } catch (error) {
        console.log(`Something went wrong : handleDeleteParty : ${error}`)
    };
};

export const printInvoice = async () => {
    try {
        const w = window.open("", "_blank");
        w.document.write(
            `
                <body style="font-family:Arial;font-size:12px">
                    <div style="width:700px;margin:auto;border:1px solid #000;padding:10px">
                        <div style="text-align:center;font-weight:bold;margin-bottom:5px">TAX INVOICE</div>
                        <table style="width:100%;border-collapse:collapse;margin-bottom:5px">
                            <tr>
                                <td style="width:50%;vertical-align:top">
                                    <b>Company Name</b><br>
                                    Address Line<br>
                                    GSTIN: 22AAAAA0000A1Z5
                                </td>

                                <td style="width:20%;vertical-align:top">
                                    <img src="logo.png" style="max-width:80px;max-height:80px">
                                </td>

                                <td style="width:30%;vertical-align:top;text-align:right">
                                    Invoice No: INV-001<br>
                                    Date: 01-02-2026
                                </td>
                            </tr>
                        </table>
                        <table style="width:100%;border-collapse:collapse;border:1px solid #000">
                            <tr>
                                <td style="width:33.33%;border:1px solid #000;padding:6px;vertical-align:top">
                                    <b>Bill To:</b><br>
                                    Party Name<br>
                                    Party Address<br>
                                    GSTIN: 33BBBBB1111B2Z6
                                </td>
                                <td style="width:33.33%;border:1px solid #000;padding:6px;vertical-align:top">
                                    <b>Ship To:</b><br>
                                    Party Name<br>
                                    Party Address<br>
                                    GSTIN: 33BBBBB1111B2Z6
                                </td>
                                <td style="width:33.33%;border:1px solid #000;padding:6px;vertical-align:top">
                                    <b>Place of Supply:</b><br>
                                    <b>Transporter:</b><br>
                                    <b>Vehicle:</b><br>
                                    <b>Ewaybill:</b><br>
                                    <b>LR No and Date:</b><br>
                                </td>
                            </tr>
                        </table>
                        <table style="width:100%;border-collapse:collapse;margin-top:5px">
                            <tr>
                                <th style="border:1px solid #000;padding:4px">Sl</th>
                                <th style="border:1px solid #000;padding:4px">Description</th>
                                <th style="border:1px solid #000;padding:4px">HSN</th>
                                <th style="border:1px solid #000;padding:4px;text-align:right">Qty</th>
                                <th style="border:1px solid #000;padding:4px;text-align:right">Rate</th>
                                <th style="border:1px solid #000;padding:4px;text-align:right">Amount</th>
                            </tr>
                            <tr>
                                <td style="border:1px solid #000;padding:4px">1</td>
                                <td style="border:1px solid #000;padding:4px">Product Name</td>
                                <td style="border:1px solid #000;padding:4px">6109</td>
                                <td style="border:1px solid #000;padding:4px;text-align:right">10</td>
                                <td style="border:1px solid #000;padding:4px;text-align:right">100</td>
                                <td style="border:1px solid #000;padding:4px;text-align:right">1000</td>
                            </tr>
                        </table>
                        <table style="width:100%;margin-top:5px">
                            <tr>
                                <td style="text-align:right">Subtotal</td>
                                <td style="text-align:right">1000</td>
                            </tr>
                            <tr>
                                <td style="text-align:right">CGST 9%</td>
                                <td style="text-align:right">90</td>
                            </tr>
                            <tr>
                                <td style="text-align:right">SGST 9%</td>
                                <td style="text-align:right">90</td>
                            </tr>
                            <tr>
                                <td style="text-align:right;font-weight:bold">Grand Total</td>
                                <td style="text-align:right;font-weight:bold">1180</td>
                            </tr>
                        </table>
                        <div style="margin-top:5px">
                            <b>Amount in Words:</b> One Thousand One Hundred Eighty Only
                        </div>
                        <table style="width:100%;border-collapse:collapse;border:1px solid #000;margin-top:10px">
                            <tr>
                                <td style="width:70%;border:1px solid #000;padding:6px;vertical-align:top">
                                    <b>Terms & Conditions:</b><br>
                                    1. Goods once sold will not be taken back.<br>
                                    2. Interest @18% p.a. will be charged on overdue bills.<br>
                                    3. Subject to local jurisdiction only.
                                </td>

                                <td style="width:30%;border:1px solid #000;padding:6px;vertical-align:top;text-align:right">
                                    <b>For Company Name</b><br><br><br>
                                    Authorised Signatory
                                </td>
                            </tr>

                            <tr>
                                <td colspan="2" style="border:1px solid #000;padding:6px">
                                    <b>Payment Details:</b><br>
                                    Bank Name: ABC Bank<br>
                                    A/C No: 1234567890<br>
                                    IFSC: ABCD0123456<br>
                                    UPI ID: company@upi
                                </td>
                            </tr>
                        </table>
                    </div>
                </body>`
        );
        w.document.close();
        w.focus();
        w.print();
    } catch (error) {
        console.log(`Something went wrong : generateInvoice : ${error}`)
    };
};

export const generateInvoice = async () => {
    try {


    } catch (error) {
        console.log(`Something went wrong : generateInvoice : ${error}`)
    };
};