import express from "express";
const router = express.Router();

import {
  createSale,
  getSales,
  getUserPurchases,
  updateUserPurchase,
} from "../controllers/sales.controller.js";

router.post("/sales", createSale);
router.get("/sales", getSales);
router.get("/sales/user", getUserPurchases);
router.put("/sales/update", updateUserPurchase);

export default router;
