import { Router } from "express";

import {
  createVerifiedProduct,
  getVerifiedProducts,
  getActiveVerifiedProducts,
  getVerifiedProduct,
  updateVerifiedProduct,
  deleteVerifiedProduct,
  toggleVerifiedProduct,
} from "../controller/verifiedProduct.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import authCheck, { authorized } from "../middleware/authCheck.js";

const router = Router();

// ============================================================
// PUBLIC
// Website par show hone wale active products
// ============================================================

router.get(
  "/active",
  getActiveVerifiedProducts,
);

// ============================================================
// ADMIN
// ============================================================

router.get(
  "/get-verifiedProducts",
   authCheck,
    authorized("admin"),
  getVerifiedProducts,
);

router.get(
  "/get-verifiedProducts/:id",
   authCheck,
    authorized("admin"),
  getVerifiedProduct,
);

// ============================================================
// CREATE
// ============================================================

router.post(
  "/create-verifiedProducts",
  upload.fields([
    {
      name: "productImage",
      maxCount: 1,
    },
    {
      name: "productVideo",
      maxCount: 1,
    },
  ]),
   authCheck,
    authorized("admin"),
  createVerifiedProduct,
);

// ============================================================
// UPDATE
// ============================================================

router.patch(
  "/update-verifiedProducts/:id",
   authCheck,
    authorized("admin"),
  upload.fields([
    {
      name: "productImage",
      maxCount: 1,
    },
    {
      name: "productVideo",
      maxCount: 1,
    },
  ]),
  updateVerifiedProduct,
);

// ============================================================
// TOGGLE
// ============================================================

router.patch(
  "/:id/toggle",
   authCheck,
    authorized("admin"),
  toggleVerifiedProduct,
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/delete-verifiedProducts/:id",
   authCheck,
    authorized("admin"),
  deleteVerifiedProduct,
);

export default router;