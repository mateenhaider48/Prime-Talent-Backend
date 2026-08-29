import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  changeAdminPassword
} from "../controller/auth.controller.js";
import authCheck, { authorized } from "../middleware/authCheck.js";

const router = Router();

// ========================= ADMIN AUTH =========================

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", getMe);

router.patch(
  "/change-password",
  authCheck,
  authorized("admin"),
  changeAdminPassword,
);

export default router;