import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
// import packageRoutes from "./routes/package.routes.js";
// import inquiryRoutes from "./routes/inquiry.routes.js";
// import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/packages", packageRoutes);
// app.use("/api/inquiries", inquiryRoutes);
// app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Tour & Travel API is running...");
});

export default app;
