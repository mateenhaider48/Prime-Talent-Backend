import { Router } from "express";

import {
  createAdvertisementRequest,
  getAdvertisementRequests,
  getAdvertisementRequest,
  updateAdvertisementRequest,
  deleteAdvertisementRequest,
} from "../controller/advertisementReq.controller.js";

import  upload  from "../middleware/upload.middleware.js"
import authCheck, { authorized } from "../middleware/authCheck.js";


const router = Router();

// Public
router.post(
  "/create-request",
  upload.fields([
    {
      name: "photoOrLogo",
      maxCount: 1,
    },
    {
      name: "productImage",
      maxCount: 1,
    },
    {
      name: "productVideo",
      maxCount: 1,
    },
  ]),
  createAdvertisementRequest,
);

// Admin
router.get(
  "/get-requests",
  authCheck,
 authorized("admin"),
  getAdvertisementRequests,
);

router.get(
  "/get-advertisements/:id",
   authCheck,
  authorized("admin"),
  getAdvertisementRequest,
);

router.patch(
  "/update-advertisement/:id",
   authCheck,
  authorized("admin"),
  updateAdvertisementRequest,
);

router.delete(
  "/delete-advertisement/:id",
   authCheck,
  authorized("admin"),
  deleteAdvertisementRequest,
);

export default router;