export const SECRETa="aslkf";
export const SECRETu="oijdh";
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { z } from "zod";

const AuthHeader= z.string().min(10).max(1000);

export const adminAuth=(req:Request,res:Response,next:NextFunction)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader) return res.status(401).json({message:"authHeader missing, failed"});
    
    const parsedAuthHeader = AuthHeader.safeParse(authHeader);
    if(!parsedAuthHeader.success){
        return res.status(401).json({message:"auth header in wrong format"});
    }
    const authParts = authHeader.split(" ");
    if(authParts.length!==2 || authParts[0].toLowerCase()!=="bearer" ){
        return res.status(401).json({message:"auth header in wrong format"});
    }
    const token= authParts[1];
    jwt.verify(token,SECRETa,(err,user)=>{
        if(err) return res.status(401).json({message:"error in jwt verification"});
        if(!user)return res.status(401).json({message:"error in jwt verification"});
        if(typeof(user)==="string")return res.status(401).json({message:"error in jwt verification"});
        req.headers["userId"]= user.id;
        next();
    })
}

export const userAuth=(req:Request,res:Response,next:NextFunction)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader) return res.status(401).json({message:"authHeader missing, failed"});
    
    const parsedAuthHeader = AuthHeader.safeParse(authHeader);
    if(!parsedAuthHeader.success){
        return res.status(401).json({message:"auth header in wrong format"});
    }
    const authParts = authHeader.split(" ");
    if(authParts.length!==2 || authParts[0].toLowerCase()!=="bearer" ){
        return res.status(401).json({message:"auth header in wrong format"});
    }
    const token= authParts[1];
    jwt.verify(token,SECRETu,(err,user)=>{
        if(err) return res.status(401).json({message:"error in jwt verification"});
        if(!user)return res.status(401).json({message:"error in jwt verification"});
        if(typeof(user)==="string")return res.status(401).json({message:"error in jwt verification"});
        req.headers["userId"]= user.id;
        next();
    })

}