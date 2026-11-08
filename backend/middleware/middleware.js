// Services / helpers...
const UserService = require("../service/user.service");
const { verifyUserToken } = require("../helper/authToken");

const unauthorized = (res, message = "Unauthorized") => res.status(401).json({ status: 401, message, body: [] });

// Copies the signed-in user onto req.body, where the controllers read it.
const applyAuth = (req) => {
    if (!req.auth) return;
    if (!req.body || typeof req.body !== "object") req.body = {};
    req.body.t_userId = req.auth.id;
    req.body.t_mobile = req.auth.mobile;
    req.body.t_username = req.auth.username;
    req.body.t_name = req.auth.name;
};

/**
 * Verifies the Bearer token and that the user still exists. The identity is set by the
 * server only: any t_userId sent by the client is overwritten.
 */
module.exports.isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) return unauthorized(res);

        let decoded;
        try {
            decoded = verifyUserToken(authHeader.slice(7).trim());
        } catch (error) {
            return unauthorized(res, error.name === "TokenExpiredError" ? "Your session has expired. Please sign in again." : "Unauthorized");
        };

        const users = await UserService.getUsers({ id: decoded.TOKEN_UID });
        if (!users?.length || users[0].is_deleted) return unauthorized(res);

        req.auth = {
            id: users[0].id,
            mobile: users[0].mobile,
            username: users[0].username,
            name: users[0].name,
        };
        applyAuth(req);
        return next();
    } catch (error) {
        console.log(`Something went wrong: middleware: isAuthenticated: ${error}`);
        return unauthorized(res);
    };
};

/**
 * Multer replaces req.body when it parses a multipart form, so routes that upload a file
 * run this after the upload to put the signed-in user back.
 */
module.exports.restoreAuth = (req, res, next) => {
    applyAuth(req);
    next();
};
