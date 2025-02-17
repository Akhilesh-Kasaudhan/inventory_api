import express from "express";
import {
  getAllMedicines,
  addMedicine,
  getMedicineById,
  addMedicineType,
  getAllMedicineType,
  updateMedicineType,
  deleteMedicineType,
} from "../controllers/medicine.controller.js";
const router = express.Router();

router.get("/get-medicineType", getAllMedicineType);

router.post("/add", addMedicine);
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);
router.post("/add-medicineType", addMedicineType);

router.patch("/update-medicineType/:id", updateMedicineType);
router.delete("/delete-medicineType/:id", deleteMedicineType);

export default router;
