import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Advertisement Backend API is running",
  });
});

// ============================================================
// ROUTES
// ============================================================

import authRoutes from "./routes/auth.routes.js";
import advertisementRoutes from "./routes/advertisements.routes.js";
import verifiedProduct from "./routes/verifiedProduct.routes.js";
import pushRoutes from "./routes/push.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/advertisement", advertisementRoutes);
app.use("/api/verfiedProducts", verifiedProduct);
app.use("/api/push", pushRoutes);
// ============================================================
// 404 HANDLER
// ============================================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;
