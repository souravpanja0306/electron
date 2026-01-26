const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');

const PORT = "3001";
const VERSION = "v1"

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(`/api/${VERSION}/party/`, require("./router/party.routes"));
app.use(`/api/${VERSION}/invoice/`, require("./router/invoice.routes"));
app.use(`/api/${VERSION}/auth/`, require("./router/auth.routes"));
app.use(`/api/${VERSION}/user/`, require("./router/user.routes"));
app.use(`/api/${VERSION}/admin/`, require("./router/admin.routes"));
app.use(`/api/${VERSION}/report/`, require("./router/report.routes"));

app.get("/", (req, res) => {
    return res.json({
        status: "200",
        body: [],
        message: "Server is Ready To Go..."
    }).status(200);
});

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}/`);
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
