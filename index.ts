import express from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";

const app= express();

app.use(express.json());
app.use(cors)

app.use("/admin",adminRouter);
app.use("/user", userRouter);

app.listen(3000, () => console.log("server running on 3000"));
