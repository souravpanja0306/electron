// Package...
const jwt = require("jsonwebtoken");

// Contents...
const contents = require("../content/contents");


exports.isAuthenticated = async (req, res, next) => {
    let response = { ...contents.defaultResponse };
    try {
        if (!req.body) req.body = {};
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            response.status = 401;
            response.message = "Unauthorized";
            response.body = [];
            return res.json(response).status(response.status);
        };
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, "secretOrPrivateKey");
        if (decoded) {
            req.body.t_userId = decoded.TOKEN_UID;
            req.body.t_mobile = decoded.TOKEN_MOBILE;
            req.body.t_username = decoded.TONEN_USERNAME;
            req.body.t_name = decoded.TONEN_NAME;
            return next();
        };
    } catch (error) {
        console.log(`Something went wrong: middleware: isAuthenticated: ${error}`);
        response.status = error.status ? error.status : 401;
        response.message = error.message ? error.message : `Something went wrong: middleware: isAuthenticated`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};
