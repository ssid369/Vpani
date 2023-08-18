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
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(3).max(50),
    password: zod_1.z.string().min(2).max(100),
    name: zod_1.z.string().min(2).max(100),
});
const signinSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(3).max(50),
    password: zod_1.z.string().min(2).max(100),
});
const IdSchema = zod_1.z.string().min(2).max(500);
const quantitySchema = zod_1.z.number().min(1).max(20);
// User routes
const searchSchema = zod_1.z.string().min(2).max(100);
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // User signup
    const { email, password, name } = req.body;
    const obj = {
        email,
        password,
        name
    };
    if (!signupSchema.safeParse(obj).success)
        return res.status(400).json({ message: "wrong input format" });
    const user = yield db_1.User.findOne({ email });
    if (user)
        return res.status(400).json({ message: "email already exists" });
    const newUser = new db_1.User(obj);
    const newCart = new db_1.Cart({
        userId: newUser._id,
    });
    yield newCart.save();
    newUser.cartId = newCart._id;
    yield newUser.save();
    const token = jsonwebtoken_1.default.sign({ id: newUser._id }, auth_1.SECRETu, { expiresIn: "1h" });
    return res.status(200).json({ message: "signup success", token });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // User signin
    const { email, password } = req.body;
    const obj = {
        email,
        password
    };
    if (!signinSchema.safeParse(obj).success)
        return res.status(400).json({ message: "wrong input format" });
    const user = yield db_1.User.findOne({ email: email, password: password });
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, auth_1.SECRETu, { expiresIn: "1h" });
    return res.status(200).json({ message: "signin success", token });
}));
router.get("/me", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId))
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    return res.status(200).json({ name: user.name });
}));
router.post("/items", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = req.body.query;
    if (!searchSchema.safeParse(searchQuery).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const searchResults = yield db_1.Product.find({ $text: { $search: searchQuery } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    return res.status(200).json(searchResults);
}));
router.get("/products", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all products
    const products = yield db_1.Product.find({}).populate(["category"]);
    return res.status(200).json({ products: products });
}));
router.get("/products/:productId", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a specific product by ID
    const productId = req.params.productId;
    if (!IdSchema.safeParse(productId))
        return res.status(400).json({ message: "wrong input format at me req" });
    const product = db_1.Product.findById(productId);
    if (!product)
        return res.status(400).json({ message: "product not found" });
    return res.status(200).json({ product: product });
}));
router.post("/cart/add/:productId", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Add a product to the user's cart
    const { quantity } = req.body;
    if (!quantitySchema.safeParse(quantity).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const productId = req.params.productId;
    if (!IdSchema.safeParse(productId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const product = yield db_1.Product.findById(productId);
    if (!product)
        return res.status(400).json({ message: "product not found" });
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const cartId = user.cartId;
    if (!IdSchema.safeParse(cartId).success)
        res.status(400).json({ message: "wrong input format at me req" });
    const cart = yield db_1.Cart.findById({ _id: cartId });
    if (!cart)
        return res.status(400).json({ message: "cart not found" });
    const idx = cart.products.findIndex((e) => {
        if (e.productId) {
            if (product._id === e.productId) {
                return true;
            }
        }
        return false;
    });
    if (idx === -1)
        cart.products.push({ productId: product._id, quantity: quantity });
    else
        cart.products[idx].quantity = quantity;
    cart.size += 1;
    if (product.price)
        cart.price += quantity * (product.price);
    yield cart.save();
    return res.status(200).json({ message: "cart updated successfully" });
}));
router.get("/cart", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the user's cart
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const cartId = user.cartId;
    if (!IdSchema.safeParse(cartId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const cart = yield db_1.Cart.findById({ _id: cartId }).populate('products.productId');
    ;
    if (!cart)
        return res.status(400).json({ message: "cart not found" });
    return res.status(200).json({ cart: cart });
}));
router.delete("/cart/remove/:productId", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Remove a product from the user's cart
    const productId = req.params.productId;
    if (!IdSchema.safeParse(productId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const product = yield db_1.Product.findById(productId);
    if (!product)
        return res.status(400).json({ message: "product not found" });
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const cartId = user.cartId;
    if (!IdSchema.safeParse(cartId).success)
        res.status(400).json({ message: "wrong input format at me req" });
    const cart = yield db_1.Cart.findById({ _id: cartId });
    if (!cart)
        return res.status(400).json({ message: "cart not found" });
    let qty = -1;
    const idx = cart.products.findIndex((e) => {
        if (e.productId) {
            if (product._id === e.productId) {
                if (e.quantity)
                    qty = e.quantity;
                return true;
            }
        }
        return false;
    });
    if (idx !== -1) {
        if (product.price)
            cart.price -= ((qty) * product.price);
        cart.products.splice(idx, 1);
    }
    yield cart.save();
    return res.status(200).json({ cart: cart });
}));
router.post("/orders", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Place a new order
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const cartId = user.cartId;
    if (!IdSchema.safeParse(cartId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const cart = yield db_1.Cart.findById({ _id: cartId });
    if (!cart)
        return res.status(400).json({ message: "cart not found" });
    if (cart.products.length === 0)
        return res.status(400).json({ message: "cart cannot be empty" });
    let orderObj = {
        userId: user._id,
        products: cart.products,
        price: cart.price,
        current: true,
        orderDate: Date.now
    };
    const newOrder = new db_1.Order(orderObj);
    yield newOrder.save();
    return res.status(200).json({ cart: cart });
}));
router.get("/orders", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the user's order history
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    return res.status(200).json({ orders: user.orders });
}));
router.get("/orders/:orderId", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get a specific order by ID
    //to be made to a middleware
    const orderId = req.params.orderId;
    if (!IdSchema.safeParse(orderId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const order = yield db_1.Order.findById(orderId);
    if (!order)
        return res.status(400).json({ message: "order not found" });
    const userId = req.headers["userId"];
    if (!IdSchema.safeParse(userId).success)
        return res.status(400).json({ message: "wrong input format at me req" });
    const user = yield db_1.User.findById(userId).populate(["cart"]);
    if (!user)
        return res.status(400).json({ message: "user not found" });
    const idx = user.orders.findIndex((e) => e._id == order._id);
    if (idx == -1)
        return res.status(400).json({ message: "order does not belogn to the current user" });
    return res.status(200).json({ orders: order });
}));
// Additional routes based on your application's requirements
exports.default = router;
