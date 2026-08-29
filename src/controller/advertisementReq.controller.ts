import { Request, Response } from "express";
import AdvertisementRequest from "../models/advertisementRequest.model.js";
import Notification from "../models/notification.model.js";

import {
  sendPushNotification,
} from "../services/push.service.js";


import { uploadToCloudinary } from "../utils/uploadToCloudinary.js"

// ============================================================
// CREATE ADVERTISEMENT REQUEST
// PUBLIC API
// User ko login ki zaroorat nahi
// ============================================================

export const createAdvertisementRequest = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      type,

      // Professional Promotion
      completeName,
      professionalTitle,
      bio,
      writeBioForMe,
      profileLinks,

      // Product Promotion
      brandBusinessName,
      productNameDetails,
      productSubCategory,
      productStoreLink,
      wantsToProceed,

      // Common
      email,
    } = req.body;

    // ========================================================
    // TYPE VALIDATION
    // ========================================================

    const allowedTypes = [
      "professional",
      "product",
    ];

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Advertisement type is required.",
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid advertisement type.",
      });
    }

    // ========================================================
    // PROFESSIONAL PROMOTION
    // ========================================================

    if (type === "professional") {
      // ------------------------------------------------------
      // REQUIRED FIELDS
      // ------------------------------------------------------

      if (
        !completeName ||
        !professionalTitle
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Complete name and professional title are required.",
        });
      }

      // ------------------------------------------------------
      // NAME MAX 15 WORDS
      // ------------------------------------------------------

      const nameWords = String(completeName)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (nameWords.length > 15) {
        return res.status(400).json({
          success: false,
          message:
            "Complete name cannot contain more than 15 words.",
        });
      }

      // ------------------------------------------------------
      // BIO / WRITE BIO OPTION
      // ------------------------------------------------------

      const shouldWriteBio =
        writeBioForMe === true ||
        writeBioForMe === "true";

      if (
        !shouldWriteBio &&
        (!bio || String(bio).trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a bio or select the option to have the bio written for you.",
        });
      }

      // ------------------------------------------------------
      // PROFILE LINKS
      // Maximum 5
      // ------------------------------------------------------

      let parsedProfileLinks: any[] = [];

      if (profileLinks) {
        try {
          parsedProfileLinks =
            typeof profileLinks === "string"
              ? JSON.parse(profileLinks)
              : profileLinks;
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "Invalid profile links format.",
          });
        }
      }

      if (!Array.isArray(parsedProfileLinks)) {
        return res.status(400).json({
          success: false,
          message:
            "Profile links must be an array.",
        });
      }

      if (parsedProfileLinks.length > 5) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 5 profile links are allowed.",
        });
      }

      // ------------------------------------------------------
      // VALIDATE EACH LINK
      // ------------------------------------------------------

      for (const link of parsedProfileLinks) {
        if (
          !link ||
          !link.title ||
          !link.url
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Each profile link must have a title and URL.",
          });
        }
      }

      // ======================================================
      // CLOUDINARY - PROFESSIONAL PHOTO / LOGO
      // ======================================================

      let photoOrLogoUrl: string | undefined;

      if (req.file) {
        const uploadedFile =
          await uploadToCloudinary(
            req.file,
            "advertisements/professional",
          );

        photoOrLogoUrl =
          uploadedFile.url;
      }

      // ======================================================
      // CREATE PROFESSIONAL REQUEST
      // ======================================================

      const advertisement =
        await AdvertisementRequest.create({
          type: "professional",

          email: email
            ? String(email)
                .trim()
                .toLowerCase()
            : undefined,

          completeName:
            String(completeName).trim(),

          professionalTitle:
            String(
              professionalTitle,
            ).trim(),

          photoOrLogo:
            photoOrLogoUrl,

          bio: bio
            ? String(bio).trim()
            : undefined,

          writeBioForMe:
            shouldWriteBio,

          profileLinks:
            parsedProfileLinks,

          status: "pending",
        });

      // ======================================================
      // NOTIFICATION
      // ======================================================

    

      const notification =
        await Notification.create({
          type: "advertisement",

          title:
            "New Advertisement Request",

          message:
            `${String(completeName).trim()} submitted a new professional advertisement request.`,

          referenceId:
            advertisement._id,

          isRead: false,
        });

   

      // ======================================================
      // PUSH NOTIFICATION
      // ======================================================

      await sendPushNotification({
        title:
          "New Advertisement Request 🔔",

        message:
          `${String(completeName).trim()} submitted a new professional advertisement request.`,

        url:
          `/admin/dashboard/advertisements`,
      });

      return res.status(201).json({
        success: true,

        message:
          "Professional promotion request submitted successfully.",

        data: advertisement,
      });
    }

    // ========================================================
    // PRODUCT PROMOTION
    // ========================================================

    if (type === "product") {
      // ------------------------------------------------------
      // REQUIRED FIELDS
      // ------------------------------------------------------

      if (
        !brandBusinessName ||
        !productNameDetails ||
        !productStoreLink
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Brand/business name, product details and product/store link are required.",
        });
      }

      // ------------------------------------------------------
      // BRAND NAME MAX 15 WORDS
      // ------------------------------------------------------

      const brandWords =
        String(brandBusinessName)
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      if (brandWords.length > 15) {
        return res.status(400).json({
          success: false,
          message:
            "Brand/business name cannot contain more than 15 words.",
        });
      }

      // ------------------------------------------------------
      // YES CHECKBOX
      // ------------------------------------------------------

      const proceed =
        wantsToProceed === true ||
        wantsToProceed === "true";

      // ======================================================
      // CLOUDINARY FILES
      // ======================================================

      let productImageUrl:
        | string
        | undefined;

      let productVideoUrl:
        | string
        | undefined;

      // ------------------------------------------------------
      // PRODUCT IMAGE
      // ------------------------------------------------------

      if (
        req.files &&
        !Array.isArray(req.files)
      ) {
        const imageFile =
          req.files.productImage?.[0];

        if (imageFile) {
          const uploadedImage =
            await uploadToCloudinary(
              imageFile,
              "advertisements/products/images",
            );

          productImageUrl =
            uploadedImage.url;
        }

        // ----------------------------------------------------
        // PRODUCT VIDEO
        // ----------------------------------------------------

        const videoFile =
          req.files.productVideo?.[0];

        if (videoFile) {
          const uploadedVideo =
            await uploadToCloudinary(
              videoFile,
              "advertisements/products/videos",
            );

          productVideoUrl =
            uploadedVideo.url;
        }
      }

      // ======================================================
      // CREATE PRODUCT REQUEST
      // ======================================================

      const advertisement =
        await AdvertisementRequest.create({
          type: "product",

          email: email
            ? String(email)
                .trim()
                .toLowerCase()
            : undefined,

          brandBusinessName:
            String(
              brandBusinessName,
            ).trim(),

          productNameDetails:
            String(
              productNameDetails,
            ).trim(),

          productSubCategory:
            productSubCategory
              ? String(
                  productSubCategory,
                ).trim()
              : undefined,

          productStoreLink:
            String(
              productStoreLink,
            ).trim(),

          // Cloudinary image URL
          productImage:
            productImageUrl,

          // Cloudinary video URL
          productVideo:
            productVideoUrl,

          wantsToProceed:
            proceed,

          status: "pending",
        });

      // ======================================================
      // NOTIFICATION
      // ======================================================

  
      const notification =
        await Notification.create({
          type: "advertisement",

          title:
            "New Advertisement Request",

          message:
            `${String(brandBusinessName).trim()} submitted a new product advertisement request.`,

          referenceId:
            advertisement._id,

          isRead: false,
        });


      // ======================================================
      // PUSH NOTIFICATION
      // ======================================================

      await sendPushNotification({
        title:
          "New Advertisement Request 🔔",

        message:
          `${String(brandBusinessName).trim()} submitted a new product advertisement request.`,

        url:
          `/admin/dashboard/advertisements`,
      });

      return res.status(201).json({
        success: true,

        message:
          "Product promotion request submitted successfully.",

        data: advertisement,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        "Unable to process advertisement request.",
    });
  } catch (error) {
    console.error(
      "Create Advertisement Request Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while submitting advertisement request.",
    });
  }
};

// ============================================================
// GET ALL ADVERTISEMENT REQUESTS
// ADMIN ONLY
// ============================================================

export const getAdvertisementRequests =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const {
        type,
        status,
      } = req.query;

      const filter: Record<
        string,
        string
      > = {};

      if (
        type === "professional" ||
        type === "product"
      ) {
        filter.type = type;
      }

      if (
        status === "pending" ||
        status === "reviewing" ||
        status === "approved" ||
        status === "rejected" ||
        status === "completed"
      ) {
        filter.status = status;
      }

      const requests =
        await AdvertisementRequest.find(
          filter,
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        message:
          "Advertisement requests fetched successfully.",

        count: requests.length,

        data: requests,
      });
    } catch (error) {
      console.error(
        "Get Advertisement Requests Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch advertisement requests.",
      });
    }
  };

// ============================================================
// GET SINGLE ADVERTISEMENT REQUEST
// ADMIN ONLY
// ============================================================

export const getAdvertisementRequest =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const request =
        await AdvertisementRequest.findById(
          id,
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Advertisement request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: request,
          message : "Your product promotion request has been submitted!"
      });
    } catch (error) {
      console.error(
        "Get Advertisement Request Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch advertisement request.",
      });
    }
  };

// ============================================================
// UPDATE ADVERTISEMENT REQUEST
// ADMIN ONLY
// ============================================================

export const updateAdvertisementRequest =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const {
        status,
        adminNote,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "reviewing",
        "approved",
        "rejected",
        "completed",
      ];

      if (
        status &&
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid advertisement status.",
        });
      }

      const request =
        await AdvertisementRequest.findByIdAndUpdate(
          id,
          {
            ...(status && {
              status,
            }),

            ...(adminNote !== undefined && {
              adminNote:
                String(adminNote).trim(),
            }),
          },
          {
            new: true,
            runValidators: true,
          },
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Advertisement request not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Advertisement request updated successfully.",

        data: request,
      });
    } catch (error) {
      console.error(
        "Update Advertisement Request Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update advertisement request.",
      });
    }
  };

// ============================================================
// DELETE ADVERTISEMENT REQUEST
// ADMIN ONLY
// ============================================================

export const deleteAdvertisementRequest =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const request =
        await AdvertisementRequest.findByIdAndDelete(
          id,
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Advertisement request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Advertisement request deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Advertisement Request Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete advertisement request.",
      });
    }
  };