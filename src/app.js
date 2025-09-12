import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import packageRoutes from "./routes/package.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import getDashboardSummary from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import PackageGroup from "./routes/packageGroup.routes.js";
import OrderRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();

// Convert env list into array
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", getDashboardSummary);
app.use("/api/review",reviewRoutes);
app.use("/api/packageGroup",PackageGroup);
app.use("/api/order",OrderRoutes)

app.get("/", (req, res) => {
  res.send("Tour & Travel API is running...");
});

export default app;
