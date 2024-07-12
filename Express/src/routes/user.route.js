import express from "express";
import asyncHandler from 'express-async-handler'
import { userSignin } from '../controllers/user.controller.js';

export const userRouter = express.Router();

//에러 시 서버 꺼짐 방지 handler
userRouter.post('/signin', asyncHandler(userSignin));
