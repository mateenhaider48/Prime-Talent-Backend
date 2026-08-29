import { Router } from "express";

import {
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey,
  sendTestPush,
} from "../controller/push.controller.js";

import { authCheck } from "../middleware/authCheck.js";

const router = Router();

// Public
router.get(
  "/vapid-public-key",
  getVapidPublicKey
);

// Admin browser subscription
router.post(
  "/subscribe",
  authCheck,
  subscribeToPush
);

// Remove subscription
router.post(
  "/unsubscribe",
  authCheck,
  unsubscribeFromPush
);

// Test notification
router.post(
  "/test",
  authCheck,
  sendTestPush
);

export default router;