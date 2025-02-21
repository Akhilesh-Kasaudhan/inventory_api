import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import medicineRoutes from "./routes/medicine.route.js";
import brandRoutes from "./routes/brand.route.js";
import { connectDB } from "./lib/connection.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
app.use(cors());
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/medicines", medicineRoutes);
app.use("/api/brands", brandRoutes);

app.listen(PORT, () => {
  console.log("server is running on port:", PORT);
  connectDB();
});
