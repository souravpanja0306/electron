const dotenv = require("dotenv");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const { connectMongo } = require("./backend/database/connection");

// ENV CONFIG...
dotenv.config({
    quiet: true
});

connectMongo();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(`/api/${process.env.VERSION}/party/`, require("./backend/router/party.routes"));
app.use(`/api/${process.env.VERSION}/company/`, require("./backend/router/company.routes"));
app.use(`/api/${process.env.VERSION}/invoice/`, require("./backend/router/invoice.routes"));
app.use(`/api/${process.env.VERSION}/auth/`, require("./backend/router/auth.routes"));
app.use(`/api/${process.env.VERSION}/user/`, require("./backend/router/user.routes"));
app.use(`/api/${process.env.VERSION}/admin/`, require("./backend/router/admin.routes"));
app.use(`/api/${process.env.VERSION}/report/`, require("./backend/router/report.routes"));
app.use(`/api/${process.env.VERSION}/money-receipt/`, require("./backend/router/moneyReceipts.routes"));
app.use(`/api/${process.env.VERSION}/challan/`, require("./backend/router/challan.routes"));

app.get("/", (req, res) => {
    return res.json({
        status: "200",
        body: [],
        message: "Server is Ready To Go..."
    }).status(200);
});

app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}/`);
});

app.use("/uploads", express.static(__dirname + "/uploads"));

// error handler middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({
        status: 500,
        message: err.message,
        body: {},
    });
});
