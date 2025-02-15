import express from "express";
import {
  getAllMedicines,
  addMedicine,
  getMedicineById,
  masterRoute,
} from "../controllers/medicine.controller.js";
const router = express.Router();

router.post("/master", masterRoute);
router.post("/add", addMedicine);
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

export default router;
