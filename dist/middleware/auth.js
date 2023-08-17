"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = exports.adminAuth = exports.SECRETu = exports.SECRETa = void 0;
exports.SECRETa = "aslkf";
exports.SECRETu = "oijdh";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const AuthHeader = zod_1.z.string().min(10).max(1000);
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "authHeader missing, failed" });
    const parsedAuthHeader = AuthHeader.safeParse(authHeader);
    if (!parsedAuthHeader.success) {
        return res.status(401).json({ message: "auth header in wrong format" });
    }
    const authParts = authHeader.split(" ");
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "auth header in wrong format" });
    }
    const token = authParts[1];
    jsonwebtoken_1.default.verify(token, exports.SECRETa, (err, user) => {
        if (err)
            return res.status(401).json({ message: "error in jwt verification" });
        if (!user)
            return res.status(401).json({ message: "error in jwt verification" });
        if (typeof (user) === "string")
            return res.status(401).json({ message: "error in jwt verification" });
        req.headers["userId"] = user.id;
        next();
    });
};
exports.adminAuth = adminAuth;
const userAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "authHeader missing, failed" });
    const parsedAuthHeader = AuthHeader.safeParse(authHeader);
    if (!parsedAuthHeader.success) {
        return res.status(401).json({ message: "auth header in wrong format" });
    }
    const authParts = authHeader.split(" ");
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "auth header in wrong format" });
    }
    const token = authParts[1];
    jsonwebtoken_1.default.verify(token, exports.SECRETu, (err, user) => {
        if (err)
            return res.status(401).json({ message: "error in jwt verification" });
        if (!user)
            return res.status(401).json({ message: "error in jwt verification" });
        if (typeof (user) === "string")
            return res.status(401).json({ message: "error in jwt verification" });
        req.headers["userId"] = user.id;
        next();
    });
};
exports.userAuth = userAuth;
