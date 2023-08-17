"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const adminSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(3).max(50),
    password: zod_1.z.string().min(2).max(100)
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const obj = {
        email,
        password
    };
    if (!adminSchema.safeParse(obj).success)
        return res.status(400).json({ message: "wrong input format" });
    const admin = yield db_1.Admin.findOne({ email });
    if (admin)
        return res.status(400).json({ message: "email already exists" });
    const newAdmin = new db_1.Admin(obj);
    yield newAdmin.save();
    const token = jsonwebtoken_1.default.sign({ id: newAdmin._id }, auth_1.SECRETa, { expiresIn: "1h" });
    return res.status(200).json({ message: "sognup success", token });
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const obj = {
        email,
        password
    };
    if (!adminSchema.safeParse(obj).success)
        return res.status(400).json({ message: "wrong input format" });
    const admin = yield db_1.Admin.findOne({ email: email, password: password });
    if (!admin)
        return res.status(400).json({ message: "admin not found" });
    const token = jsonwebtoken_1.default.sign({ id: admin._id }, auth_1.SECRETa, { expiresIn: "1h" });
    return res.status(200).json({ message: "sognup success", token });
}));
router.post("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
router.put("/products/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
router.get("/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all orders
}));
router.get("/orders/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a specific order by ID
}));
router.put("/orders/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the status of an order by ID (e.g., mark as shipped)
}));
router.delete("/products/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete a product by ID
}));
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a list of all users
}));
router.get("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get user details by ID
}));
router.put("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Update user details by ID
}));
exports.default = router;
