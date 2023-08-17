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
const auth_2 = require("../middleware/auth");
const router = express_1.default.Router();
const adminSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(3).max(50),
    password: zod_1.z.string().min(2).max(100)
});
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200),
    description: zod_1.z.string().min(10).max(1000),
    price: zod_1.z.number().min(1).max(1e9),
    image: zod_1.z.string().min(2).url().optional(),
    category: zod_1.z.array(zod_1.z.string()).min(1),
    stock: zod_1.z.number().int().min(0).optional(),
});
const statusSchema = zod_1.z.enum(["delivered", "dispatched", "processing", "returned"]);
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
    return res.status(200).json({ message: "signup success", token });
}));
router.post("/products", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const obj = req.body;
    if (!productSchema.safeParse(obj))
        return res.status(400).json({ message: "wrong product input format" });
    const newProduct = new db_1.Product(obj);
    yield newProduct.save();
    return res.status(200).json({ message: "product added successfully" });
}));
router.put("/products/:productId", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield db_1.Product.findById(req.params.productId);
    if (!product)
        return res.status(404).json({ message: "product not found" });
    const obj = req.body;
    if (!productSchema.partial().safeParse(obj).success)
        return res.status(400).json({ message: "wrong product input format" });
    Object.assign(product, obj);
    yield product.save();
    return res.status(200).json({ message: "product updated successfully" });
}));
router.get("/products", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield db_1.Product.find({}).populate(["category"]);
    res.status(200).json({ products: products });
}));
router.get("/orders", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all orders
    const orders = yield db_1.Order.find({ current: true });
    res.status(200).json({ orders: orders });
}));
router.get("/ordersp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all orders
    const orders = yield db_1.Order.find({ current: false });
    res.status(200).json({ orders: orders });
}));
router.get("/orders/:orderId", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a specific order by ID
    const order = yield db_1.Order.findById({ _id: req.params.orderId });
    if (!order)
        return res.status(400).json({ message: "order does not exist" });
    res.status(200).json({ orders: order });
}));
router.put("/orders/:orderId", auth_2.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the status of an order by ID (e.g., mark as shipped)
    const { status } = req.body;
    const order = yield db_1.Order.findById({ _id: req.params.orderId });
    if (!order)
        return res.status(400).json({ message: "order does not exist" });
    if (!statusSchema.safeParse(status).success)
        res.status(400).json({ message: "such a stutus is not aloowed , either delivered,dispatched,processing,returned" });
    order.status = status;
    yield order.save();
    res.status(200).json({ message: "updated order" });
}));
router.delete("/products/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete a product by ID
    try {
        const product = yield db_1.Product.findByIdAndDelete(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Error deleting product" });
    }
}));
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a list of all users
    const users = db_1.User.find({});
    return res.status(200).json({ users: users });
}));
router.get("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get user details by ID
    const users = db_1.User.findById({ _id: req.params.userId });
    if (!users)
        return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ users: users });
}));
exports.default = router;
