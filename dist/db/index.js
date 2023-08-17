"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.Cart = exports.Order = exports.Admin = exports.User = exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cartSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    products: [{ item: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product" },
            quantity: Number }],
    price: Number,
    size: { type: Number, default: 0 }
});
const userSchema = new mongoose_1.default.Schema({
    email: String,
    name: String,
    password: String,
    cart: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Cart" },
    orders: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order" }]
});
const adminSchema = new mongoose_1.default.Schema({
    email: String,
    password: String,
});
const productSchema = new mongoose_1.default.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
    category: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Category" }],
    stock: Number,
});
const orderSchema = new mongoose_1.default.Schema({
    userId: { type: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" } },
    items: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product" }],
    price: Number,
    status: String,
    orderDate: { type: Date, default: Date.now }
});
const categorySchema = new mongoose_1.default.Schema({
    name: String,
    description: String
});
exports.Category = mongoose_1.default.model("Category", categorySchema);
exports.User = mongoose_1.default.model("User", userSchema);
exports.Admin = mongoose_1.default.model("Admin", adminSchema);
exports.Order = mongoose_1.default.model("Order", orderSchema);
exports.Cart = mongoose_1.default.model("Cart", cartSchema);
exports.Product = mongoose_1.default.model("Product", productSchema);
