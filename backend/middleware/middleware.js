// Package...
const jwt = require("jsonwebtoken");

// Contents...
const contents = require("../content/contents");

// Services...
const UserService = require("../service/user.service");

module.exports.isAuthenticated = async (req, res, next) => {
    let response = { ...contents.defaultResponse };
    try {
        if (!req.body) req.body = {};
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            response.status = 401;
            response.message = "Unauthorized";
            response.body = [];
            return res.status(response.status).json(response);
        };
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, "secretOrPrivateKey");

        let userExists = await UserService.getUsers({ id: decoded.TOKEN_UID });
        if (!userExists.length) {
            response.status = 401;
            response.message = "Unauthorized";
            response.body = [];
            return res.status(response.status).json(response);
        };

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
    return res.status(response.status).json(response);
};
