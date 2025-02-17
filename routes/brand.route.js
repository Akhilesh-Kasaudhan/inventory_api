import express from "express";
const router = express.Router();
import {
  addBrandName,
  getBrandName,
  updateBrandName,
  deleteBrandName,
} from "../controllers/brand.controller";

router.post("/add-brand", addBrandName);
router.get("/get-brand", getBrandName);
router.patch("update-brand", updateBrandName);
router.delete("delete-brand", deleteBrandName);
export default router;
