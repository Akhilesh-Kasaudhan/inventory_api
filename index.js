import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import medicineRoutes from "./routes/medicine.route.js";
import brandRoutes from "./routes/brand.route.js";
import saleRoutes from "./routes/sales.route.js";
import { connectDB } from "./lib/connection.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const HOST = "0.0.0.0";
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any localhost and your deployed frontend
    const allowedOrigins = [
      "https://ram.webexbytes.com/", // Add your production frontend
    ];

    if (!origin || origin.startsWith("http://localhost")) {
      return callback(null, true); // Allow all localhost ports
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // Allow defined external origins
    }

    return callback(new Error("Not allowed by CORS")); // Block unknown origins
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/medicines", medicineRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api", saleRoutes);
app.use((req, res, next) => {
  console.log("Incoming request from:", req.headers.origin);
  next();
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  connectDB();
});
