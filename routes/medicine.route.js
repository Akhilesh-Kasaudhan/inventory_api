import express from "express";
import {
  getMedicines,
  addMedicine,
  addMedicineType,
  getAllMedicineType,
  updateMedicineType,
  deleteMedicineType,
  updateMedicine,
} from "../controllers/medicine.controller.js";
const router = express.Router();

router.get("/get-medicineType", getAllMedicineType);

router.post("/add-medicine", addMedicine);
router.get("/get-medicine", getMedicines);
router.patch("/update-medicine/:id", updateMedicine);
router.post("/add-medicineType", addMedicineType);

router.patch("/update-medicineType/:id", updateMedicineType);
router.delete("/delete-medicineType/:id", deleteMedicineType);

export default router;
