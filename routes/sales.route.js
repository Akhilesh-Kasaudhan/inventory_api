import express from "express";
const router = express.Router();

import {
  createSale,
  getSales,
  updateUserPurchase,
  getPurchasesByBuyer,
  getPurchaseById,
} from "../controllers/sales.controller.js";

router.post("/sales", createSale);
router.get("/sales", getSales);
router.get("/sales/buyer", getPurchasesByBuyer); // Fetch sales by buyer's name or GST Number
router.get("/sales/:id", getPurchaseById);
router.put("/sales/update", updateUserPurchase);

export default router;
