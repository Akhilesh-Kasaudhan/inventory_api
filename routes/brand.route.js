import express from "express";
const router = express.Router();
import {
  addBrandName,
  getBrandName,
  updateBrandName,
  deleteBrandName,
} from "../controllers/brand.controller.js";

router.post("/add-brand", addBrandName);
router.get("/get-brand", getBrandName);
router.patch("/update-brand/:id", updateBrandName);
router.delete("/delete-brand/:id", deleteBrandName);
export default router;
