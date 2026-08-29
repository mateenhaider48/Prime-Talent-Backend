import { Router } from "express";

import {
  getSettings,
  updateSettings,
} from "../controller/settings.controller.js";

import authCheck, { authorized } from "../middleware/authCheck.js";

const router = Router();

// ============================================================
// PUBLIC
// Website footer/whatsapp button ke liye
// ============================================================

router.get("/", getSettings);

// ============================================================
// ADMIN
// ============================================================

router.patch(
  "/",
  authCheck,
  authorized("admin"),
  updateSettings,
);

export default router;