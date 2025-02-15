import express from "express";
import {
  login,
  signup,
  changePassword,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/change-password", protectedRoute, changePassword);

export default router;
