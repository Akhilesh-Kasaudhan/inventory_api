import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import medicineRoutes from "./routes/medicine.route.js";
import brandRoutes from "./routes/brand.route.js";
import saleRoutes from "./routes/sales.route.js";
import vendorRoutes from "./routes/vendor.route.js";
import { connectDB } from "./lib/connection.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL; // Ensure this is set in .env
const HOST = "0.0.0.0";

// 🔹 Security Middlewares
app.use(helmet()); // Protects API with security headers
app.use(cookieParser()); // Parses cookies
app.use(morgan("dev")); // Logs API requests

// 🔹 Rate Limiting - Prevents too many requests
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per 15 min
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// 🔹 CORS Configuration - Fixes Strict-Origin-When-Cross-Origin Errors
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  CLIENT_URL, // Production frontend (from .env)
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true, // Allow cookies & authentication headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// Apply CORS Middleware
app.use(cors(corsOptions));

// Handle Preflight Requests (OPTIONS)
app.options("*", cors(corsOptions));

// Middleware for JSON & URL Encoding
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔹 Routes
app.use("/api/auth", authRoute);
app.use("/api/medicines", medicineRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api", saleRoutes);
app.use("/api", vendorRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  connectDB();
});
