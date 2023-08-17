import express from "express"
import { number, string, z } from "zod";
import { User,Admin,Product,Cart,Category, Order } from "../db";
import jwt from "jsonwebtoken";
import { SECRETa } from "../middleware/auth";
import { adminAuth } from "../middleware/auth";

const router= express.Router();

const adminSchema= z.object({
    email: z.string().email().min(3).max(50),
    password: z.string().min(2).max(100)
});

const productSchema= z.object({
    name:z.string().min(2).max(200),
    description:z.string().min(10).max(1000),
    price:z.number().min(1).max(1e9),
    image:z.string().min(2).url().optional(),
    category: z.array(z.string()).min(1), 
    stock: z.number().int().min(0).optional(),
})
const statusSchema= z.enum(["delivered","dispatched","processing","returned"])
type adminType= z.infer<typeof adminSchema>;

router.post("/signup", async (req,res)=>{
    const {email,password}=req.body;
    const obj={
        email,
        password
    };
    if(!adminSchema.safeParse(obj).success) return res.status(400).json({message:"wrong input format"});
    const admin= await Admin.findOne({email});
    if(admin)return res.status(400).json({message:"email already exists"});
    const newAdmin= new Admin(obj);
    await newAdmin.save();
    const token= jwt.sign({id:newAdmin._id},SECRETa,{expiresIn:"1h"});
    return res.status(200).json({message:"sognup success",token});
});

router.post("/login", async (req,res)=>{
    const {email,password}=req.body;
    const obj={
        email,
        password
    };
    if(!adminSchema.safeParse(obj).success) return res.status(400).json({message:"wrong input format"});
    const admin= await Admin.findOne({email:email, password:password});
    if(!admin)return res.status(400).json({message:"admin not found"});
    const token= jwt.sign({id:admin._id},SECRETa,{expiresIn:"1h"});
    return res.status(200).json({message:"signup success",token});
});
router.post("/products",adminAuth, async (req,res)=>{
    const obj= req.body;
    if(!productSchema.safeParse(obj)) return res.status(400).json({message:"wrong product input format"});
    const newProduct= new Product(obj);
    await newProduct.save();
    return res.status(200).json({message:"product added successfully"});
});
router.put("/products/:productId",adminAuth, async (req,res)=>{
    const product = await Product.findById( req.params.productId);
    if(!product)return res.status(404).json({message:"product not found"});
    const obj= req.body;
    if(!productSchema.partial().safeParse(obj).success)return res.status(400).json({message:"wrong product input format"});
    Object.assign(product,obj);
    await product.save();
    return res.status(200).json({message:"product updated successfully"});
});
router.get("/products",adminAuth, async (req,res)=>{
    const products= await Product.find({}).populate(["category"]);
    res.status(200).json({products:products});
});
router.get("/orders",adminAuth, async (req, res) => {
    // Get all orders
    const orders = await Order.find({current:true});
    res.status(200).json({orders:orders});
});
router.get("/ordersp", async (req, res) => {
    // Get all orders
    const orders = await Order.find({current:false});
    res.status(200).json({orders:orders});
});
 
router.get("/orders/:orderId",adminAuth, async (req, res) => {
    // Get a specific order by ID
    const order= await Order.findById({_id:req.params.orderId});
    if(!order) return res.status(400).json({message:"order does not exist"});
    res.status(200).json({orders:order});
});
 
router.put("/orders/:orderId",adminAuth, async (req, res) => {
    // Update the status of an order by ID (e.g., mark as shipped)
    const {status}= req.body;
    const order= await Order.findById({_id:req.params.orderId});
    if(!order) return res.status(400).json({message:"order does not exist"});
    if(!statusSchema.safeParse(status).success) res.status(400).json({message:"such a stutus is not aloowed , either delivered,dispatched,processing,returned"});
    order.status=status;
    await order.save();
    res.status(200).json({message:"updated order"});
});
router.delete("/products/:productId", async (req, res) => {
    // Delete a product by ID
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
    
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        return res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Error deleting product" });
      }
});

router.get("/users", async (req, res) => {
    // Get a list of all users
    const users=User.find({});
    return res.status(200).json({users:users});
});

router.get("/users/:userId", async (req, res) => {
    // Get user details by ID
    const users=User.findById({_id:req.params.userId});
    if(!users)return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({users:users});
});


export default router;