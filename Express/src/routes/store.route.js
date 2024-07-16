import asyncHandler from "express-async-handler";
import { reviewPreview } from "../controllers/store.controller.js";
import express from "express";

export const storeRouter = express.Router({mergeParams: true});
storeRouter.get('/reviews', asyncHandler(reviewPreview));
