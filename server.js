const express = require("express");
const cors = require("cors");

const app = express();
const PORT = "3001";
const VERSION = "v1"

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(`/api/${VERSION}/party/`, require("./backend/router/party.routes"));
app.use(`/api/${VERSION}/invoice/`, require("./backend/router/invoice.routes"));
app.use(`/api/${VERSION}/auth/`, require("./backend/router/auth.routes"));
app.use(`/api/${VERSION}/user/`, require("./backend/router/user.routes"));
app.use(`/api/${VERSION}/admin/`, require("./backend/router/admin.routes"));

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