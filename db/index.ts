import mongoose, { Mongoose } from "mongoose";
import { boolean } from "zod";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [{productId:{type: mongoose.Schema.Types.ObjectId,ref: "Product" },
     quantity:Number} ],
    price:{type:Number, default:0},
    size:{type:Number, default:0}
});

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    password: String,
    address:String,
    pincode:Number,
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" }, // Reference to the Cart schema
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
});

const adminSchema =new mongoose.Schema({
    email: String,
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
productSchema.index({ name: 'text', description: 'text',category:"text" });

const orderSchema = new mongoose.Schema({
    userId:{type:{type: mongoose.Schema.Types.ObjectId, ref:"User"}},
    products: [{productId:{type: mongoose.Schema.Types.ObjectId,ref: "Product" },
     quantity:Number}],
    price:Number,
    status:String,
    current:{type:Boolean, default: true},
    orderDate: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name:String,
    description:String,
    products:[{type:mongoose.Schema.Types.ObjectId, ref:"Product"}]
});

export const Category = mongoose.model("Category",categorySchema);
export const User=mongoose.model("User",userSchema);
export const Admin=mongoose.model("Admin",adminSchema);
export const Order=mongoose.model("Order",orderSchema);
export const Cart=mongoose.model("Cart",cartSchema);
export const Product=mongoose.model("Product",productSchema);
