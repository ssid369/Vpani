import express from "express"
import { z } from "zod";
import { User,Admin,Product,Cart,Category, Order } from "../db";
const router= express.Router();
import { userAuth,SECRETu } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { Types } from 'mongoose'; // Import necessary types


const signupSchema= z.object({
   email: z.string().email().min(3).max(50),
   password: z.string().min(2).max(100),
   name: z.string().min(2).max(100),
});

const signinSchema= z.object({
   email: z.string().email().min(3).max(50),
   password: z.string().min(2).max(100),
});
const IdSchema= z.string().min(2).max(500);
const quantitySchema = z.number().min(1).max(20);
// User routes

const searchSchema = z.string().min(2).max(100);



router.post("/signup", async (req, res) => {
   // User signup
   const {email,password,name}=req.body;
    const obj={
        email,
        password,
        name
    };
    if(!signupSchema.safeParse(obj).success) return res.status(400).json({message:"wrong input format"});
    const user= await User.findOne({email});
    if(user)return res.status(400).json({message:"email already exists"});
    const newUser= new User(obj);
    const newCart= new Cart({
      userId:newUser._id,
    });
    await newCart.save();
    newUser.cartId=newCart._id;
    await newUser.save();
    const token= jwt.sign({id:newUser._id},SECRETu,{expiresIn:"1h"});
    return res.status(200).json({message:"signup success",token});

});

router.post("/signin", async (req, res) => {
   // User signin
   const {email,password}=req.body;
    const obj={
        email,
        password
    };
    if(!signinSchema.safeParse(obj).success) return res.status(400).json({message:"wrong input format"});
    const user= await User.findOne({email:email, password:password});
    if(!user)return res.status(400).json({message:"user not found"});
    const token= jwt.sign({id:user._id},SECRETu,{expiresIn:"1h"});
    return res.status(200).json({message:"signin success",token});

});

router.get("/me",userAuth, async (req,res)=>{
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId))return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId);
   if(!user) return res.status(400).json({message:"user not found"});
   return res.status(200).json({name:user.name})
});


router.post("/items",userAuth,async (req,res)=>{
   const searchQuery= req.body.query;
   if(!searchSchema.safeParse(searchQuery).success)return res.status(400).json({message:"wrong input format at me req"});
   const searchResults = await Product.find(
       { $text: { $search: searchQuery } },
       { score: { $meta: "textScore" } }
     ).sort({ score: { $meta: "textScore" } });
   return res.status(200).json(searchResults);
});

router.get("/products",userAuth, async (req, res) => {
   // Get all products
   const products= await Product.find({}).populate(["category"]);
   return res.status(200).json({products:products});
});

router.get("/products/:productId",userAuth, async (req, res) => {
   // Get a specific product by ID
   const productId= req.params.productId;
   if(!IdSchema.safeParse(productId))return res.status(400).json({message:"wrong input format at me req"});
   const product = Product.findById(productId);
   if(!product) return res.status(400).json({message:"product not found"});
   return res.status(200).json({product:product});
});

router.post("/cart/add/:productId",userAuth, async (req, res) => {
   // Add a product to the user's cart
   const {quantity}= req.body;
   if(!quantitySchema.safeParse(quantity).success)return res.status(400).json({message:"wrong input format at me req"}); 
   
   const productId= req.params.productId;
   if(!IdSchema.safeParse(productId).success) return res.status(400).json({message:"wrong input format at me req"});
   const product= await Product.findById(productId);
   if(!product)return res.status(400).json({message:"product not found"});
   
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});
   
   const cartId=user.cartId;
   if(!IdSchema.safeParse(cartId).success) res.status(400).json({message:"wrong input format at me req"});
   const cart= await Cart.findById({_id:cartId});
   if(!cart)return res.status(400).json({message:"cart not found"});
   
   const idx= cart.products.findIndex((e)=>{
      if(e.productId){
         if(product._id===e.productId){
            return true;
         }
      }
      return false;
   });

   if(idx===-1) cart.products.push({productId:product._id,quantity:quantity});
   else cart.products[idx].quantity=quantity;
   cart.size+=1;
   if(product.price)cart.price+=quantity*(product.price);
   await cart.save();
   return res.status(200).json({message:"cart updated successfully"});
});

router.get("/cart",userAuth, async (req, res) => {
   // Get the user's cart
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});

   const cartId=user.cartId;
   if(!IdSchema.safeParse(cartId).success) return res.status(400).json({message:"wrong input format at me req"});
   const cart= await Cart.findById({_id:cartId}).populate('products.productId');;
   if(!cart)return res.status(400).json({message:"cart not found"});
   
   return res.status(200).json({cart:cart});

   
});

router.delete("/cart/remove/:productId",userAuth, async (req, res) => {
   // Remove a product from the user's cart
   const productId= req.params.productId;
   if(!IdSchema.safeParse(productId).success) return res.status(400).json({message:"wrong input format at me req"});
   const product= await Product.findById(productId);
   if(!product)return res.status(400).json({message:"product not found"});
   
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});
   
   const cartId=user.cartId;
   if(!IdSchema.safeParse(cartId).success) res.status(400).json({message:"wrong input format at me req"});
   const cart= await Cart.findById({_id:cartId});
   if(!cart)return res.status(400).json({message:"cart not found"});
   
   let qty=-1;
   const idx= cart.products.findIndex((e)=>{
      if(e.productId){
         if(product._id===e.productId){
            if(e.quantity)qty=e.quantity;
            return true;
         }
      }
      return false;
   });

   if(idx!==-1){
      if(product.price)cart.price-=((qty)*product.price);
      cart.products.splice(idx,1);
   } 
   await cart.save();
   return res.status(200).json({cart:cart});
});

router.post("/orders",userAuth, async (req, res) => {
   // Place a new order
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});
   
   const cartId=user.cartId;
   if(!IdSchema.safeParse(cartId).success) return res.status(400).json({message:"wrong input format at me req"});
   const cart= await Cart.findById({_id:cartId});
   if(!cart)return res.status(400).json({message:"cart not found"});
   if(cart.products.length===0)return res.status(400).json({message:"cart cannot be empty"});

   let orderObj={
      userId:user._id,
      products:cart.products,
      price:cart.price,
      current:true,
      orderDate:Date.now
   }

   const newOrder= new Order(orderObj);
   await newOrder.save();
   return res.status(200).json({cart:cart});
});

router.get("/orders",userAuth, async (req, res) => {
   // Get the user's order history
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});

   return res.status(200).json({orders:user.orders});

});

router.get("/orders/:orderId",userAuth, async (req, res) => {
    // Get a specific order by ID
   //to be made to a middleware
    const orderId= req.params.orderId;
   if(!IdSchema.safeParse(orderId).success)return res.status(400).json({message:"wrong input format at me req"});
   const order= await Order.findById(orderId);
   if(!order)return res.status(400).json({message:"order not found"});
   
   const userId= req.headers["userId"];
   if(!IdSchema.safeParse(userId).success)return res.status(400).json({message:"wrong input format at me req"});
   const user= await User.findById(userId).populate(["cart"]);
   if(!user) return res.status(400).json({message:"user not found"});
   
   const idx= user.orders.findIndex((e)=> e._id==order._id);
   if(idx==-1)return res.status(400).json({message:"order does not belogn to the current user"});
   return res.status(200).json({orders:order});
});

// Additional routes based on your application's requirements

export default router;