import mongoose, { Mongoose } from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [{item:{type: mongoose.Schema.Types.ObjectId,ref: "Product" },
     quantity:Number} ],
    price:Number,
    size:{type:Number, default:0}
});

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    password: String,
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" }, // Reference to the Cart schema
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
});

const adminSchema =new mongoose.Schema({
    username: String,
    name:String,
    password: String,
});

const productSchema = new mongoose.Schema({
    name:String,
    description:String,
    price:Number,
    image:String,
    category:[{type: mongoose.Schema.Types.ObjectId, ref:"Category"}],
    stock:Number,
});

const orderSchema = new mongoose.Schema({
    userId:{type:{type: mongoose.Schema.Types.ObjectId, ref:"User"}},
    items:[{type: mongoose.Schema.Types.ObjectId, ref:"Product"}],
    price:Number,
    status:String,
    orderDate: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name:String,
    description:String
});

export const Category = mongoose.model("Category",categorySchema);
export const User=mongoose.model("User",userSchema);
export const Admin=mongoose.model("Admin",adminSchema);
export const Order=mongoose.model("Order",orderSchema);
export const Cart=mongoose.model("Cart",cartSchema);
export const Product=mongoose.model("Product",productSchema);
