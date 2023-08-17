import express from "express"
import { z } from "zod";
import { User,Admin,Product,Cart,Category } from "../db";
import jwt from "jsonwebtoken";
import { SECRETa } from "../middleware/auth";

const router= express.Router();

const adminSchema= z.object({
    email: z.string().email().min(3).max(50),
    password: z.string().min(2).max(100)
})

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
    return res.status(200).json({message:"sognup success",token});
});
router.post("/products", async (req,res)=>{

});
router.put("/products/:productId", async (req,res)=>{

});
router.get("/products", async (req,res)=>{

});
router.get("/orders", async (req, res) => {
    // Get all orders
});
 
router.get("/orders/:orderId", async (req, res) => {
    // Get a specific order by ID
});
 
router.put("/orders/:orderId", async (req, res) => {
    // Update the status of an order by ID (e.g., mark as shipped)
});
router.delete("/products/:productId", async (req, res) => {
    // Delete a product by ID
});

router.get("/users", async (req, res) => {
    // Get a list of all users
});

router.get("/users/:userId", async (req, res) => {
    // Get user details by ID
});

router.put("/users/:userId", async (req, res) => {
    // Update user details by ID
});
 

export default router;