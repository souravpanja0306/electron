// Services / helpers...
const UserService = require("../service/user.service");
const AccessService = require("../service/access.service");
const { verifyUserToken } = require("../helper/authToken");

const unauthorized = (res, message = "Unauthorized") => res.status(401).json({ status: 401, message, body: [] });

/** 403 sent while the account is locked or the subscription has lapsed. The app shows its lock screen. */
const locked = (res, access) => res.status(403).json({ status: 403, code: access.code, message: access.message, body: { access } });

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
 * server only: any t_userId sent by the client is overwritten. With `checkAccess`, a locked
 * account or lapsed subscription is refused with 403 (see service/access.service.js).
 */
const authenticate = (checkAccess) => async (req, res, next) => {
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
        if (checkAccess) {
            const access = await AccessService.getAccess(req.auth);
            if (access.locked) return locked(res, access);
        };
        applyAuth(req);
        return next();
    } catch (error) {
        console.log(`Something went wrong: middleware: isAuthenticated: ${error}`);
        return unauthorized(res);
    };
};

/** Signed in and allowed to use the app. Used by every business route. */
module.exports.isAuthenticated = authenticate(true);

/** Signed in, lock not checked. Only for the subscription status endpoint the lock screen uses. */
module.exports.isSignedIn = authenticate(false);

/**
 * Multer replaces req.body when it parses a multipart form, so routes that upload a file
 * run this after the upload to put the signed-in user back.
 */
module.exports.restoreAuth = (req, res, next) => {
    applyAuth(req);
    next();
};
