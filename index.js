import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import medicineRoutes from "./routes/medicine.route.js";
import brandRoutes from "./routes/brand.route.js";
import saleRoutes from "./routes/sales.route.js";
import { connectDB } from "./lib/connection.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const HOST = "0.0.0.0";
// 🔹 Security Middlewares
app.use(helmet()); // Protects API with security headers
app.use(cookieParser()); // Parses cookies
app.use(morgan("dev")); // Logs API requests

// 🔹 Rate Limiting - Prevents too many requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 min
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// 🔹 CORS Configuration - Allow Any Localhost Port
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.startsWith("http://localhost")) {
      callback(null, true); // Allow requests from any localhost port
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies & authorization headers
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" })); // Prevents large payload attacks

app.options("*", cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/medicines", medicineRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api", saleRoutes);
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  connectDB();
});
