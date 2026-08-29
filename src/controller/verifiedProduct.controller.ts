import { Request, Response } from "express";

import VerifiedProduct from "../models/verifiedProduct.model.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// ============================================================
// CREATE VERIFIED PRODUCT
// ADMIN ONLY
// ============================================================

export const createVerifiedProduct = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      brandName,
      productName,
      description,
      couponCode,
      discount,
      storeLink,
    } = req.body;
    // ========================================================
    // VALIDATION
    // ========================================================
   
    if (
      !brandName ||
      !description ||
      !storeLink
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Brand name, product name, description and store link are required.",
      });
    }
    

    // ========================================================
    // FILES
    // ========================================================

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;
 
    const imageFile =
      files?.productImage?.[0];

    const videoFile =
      files?.productVideo?.[0];

    let imageUrl = "";
    let videoUrl = "";

    // ========================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ========================================================

    if (imageFile) {
      const uploadedImage =
        await uploadToCloudinary(
          imageFile,
          "verified-products/images",
        );

      imageUrl = uploadedImage.url;
    }

    // ========================================================
    // UPLOAD VIDEO TO CLOUDINARY
    // ========================================================

    if (videoFile) {
      const uploadedVideo =
        await uploadToCloudinary(
          videoFile,
          "verified-products/videos",
        );

      videoUrl = uploadedVideo.url;
    }

    // ========================================================
    // CREATE PRODUCT
    // ========================================================

    const product =
      await VerifiedProduct.create({
        brandName:
          String(brandName).trim(),

        productName:
          String(productName).trim(),

        description:
          String(description).trim(),

        couponCode: couponCode
          ? String(couponCode)
              .trim()
              .toUpperCase()
          : undefined,

        discount: discount
          ? String(discount).trim()
          : undefined,

        storeLink:
          String(storeLink).trim(),

        productImage:
          imageUrl,

        productVideo:
          videoUrl,

        isActive: true,
      });

    return res.status(201).json({
      success: true,

      message:
        "Verified product created successfully.",

      data: product,
    });
  } catch (error) {
    console.error(
      "Create Verified Product Error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create verified product.",
    });
  }
};

// ============================================================
// GET ALL VERIFIED PRODUCTS
// ADMIN
// ============================================================

export const getVerifiedProducts = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const products =
      await VerifiedProduct.find().sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Verified products fetched successfully.",

      count: products.length,

      data: products,
    });
  } catch (error) {
    console.error(
      "Get Verified Products Error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch verified products.",
    });
  }
};

// ============================================================
// GET ACTIVE VERIFIED PRODUCTS
// PUBLIC
// ============================================================

export const getActiveVerifiedProducts =
  async (
    _req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const products =
        await VerifiedProduct.find({
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        message:
          "Active verified products fetched successfully.",

        count: products.length,

        data: products,
      });
    } catch (error) {
      console.error(
        "Get Active Verified Products Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch verified products.",
      });
    }
  };

// ============================================================
// GET SINGLE VERIFIED PRODUCT
// ADMIN
// ============================================================

export const getVerifiedProduct = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const product =
      await VerifiedProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message:
          "Verified product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data: product,
    });
  } catch (error) {
    console.error(
      "Get Verified Product Error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch verified product.",
    });
  }
};

// ============================================================
// UPDATE VERIFIED PRODUCT
// ADMIN ONLY
// ============================================================

export const updateVerifiedProduct =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const {
        brandName,
        productName,
        description,
        couponCode,
        discount,
        storeLink,
        isActive,
      } = req.body;

      // ======================================================
      // FIND EXISTING PRODUCT
      // ======================================================

      const existingProduct =
        await VerifiedProduct.findById(id);

      if (!existingProduct) {
        return res.status(404).json({
          success: false,

          message:
            "Verified product not found.",
        });
      }

      // ======================================================
      // FILES
      // ======================================================

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const imageFile =
        files?.productImage?.[0];

      const videoFile =
        files?.productVideo?.[0];

      // ======================================================
      // UPDATE DATA
      // ======================================================

      const updateData: Record<
        string,
        unknown
      > = {};

      // ======================================================
      // TEXT FIELDS
      // ======================================================

      if (brandName !== undefined) {
        updateData.brandName =
          String(brandName).trim();
      }

      if (productName !== undefined) {
        updateData.productName =
          String(productName).trim();
      }

      if (description !== undefined) {
        updateData.description =
          String(description).trim();
      }

      if (couponCode !== undefined) {
        updateData.couponCode =
          String(couponCode)
            .trim()
            .toUpperCase();
      }

      if (discount !== undefined) {
        updateData.discount =
          String(discount).trim();
      }

      if (storeLink !== undefined) {
        updateData.storeLink =
          String(storeLink).trim();
      }

      if (isActive !== undefined) {
        updateData.isActive =
          isActive === true ||
          isActive === "true";
      }

      // ======================================================
      // UPLOAD NEW IMAGE TO CLOUDINARY
      // ======================================================

      if (imageFile) {
        const uploadedImage =
          await uploadToCloudinary(
            imageFile,
            "verified-products/images",
          );

        updateData.productImage =
          uploadedImage.url;
      }

      // ======================================================
      // UPLOAD NEW VIDEO TO CLOUDINARY
      // ======================================================

      if (videoFile) {
        const uploadedVideo =
          await uploadToCloudinary(
            videoFile,
            "verified-products/videos",
          );

        updateData.productVideo =
          uploadedVideo.url;
      }

      // ======================================================
      // UPDATE
      // ======================================================

      const product =
        await VerifiedProduct.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
          },
        );

      if (!product) {
        return res.status(404).json({
          success: false,

          message:
            "Verified product not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Verified product updated successfully.",

        data: product,
      });
    } catch (error) {
      console.error(
        "Update Verified Product Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update verified product.",
      });
    }
  };

// ============================================================
// DELETE VERIFIED PRODUCT
// ADMIN ONLY
// ============================================================

export const deleteVerifiedProduct =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const product =
        await VerifiedProduct.findByIdAndDelete(
          id,
        );

      if (!product) {
        return res.status(404).json({
          success: false,

          message:
            "Verified product not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Verified product deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Verified Product Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete verified product.",
      });
    }
  };

// ============================================================
// TOGGLE ACTIVE STATUS
// ADMIN ONLY
// ============================================================

export const toggleVerifiedProduct =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { id } = req.params;

      const product =
        await VerifiedProduct.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,

          message:
            "Verified product not found.",
        });
      }

      product.isActive =
        !product.isActive;

      await product.save();

      return res.status(200).json({
        success: true,

        message: product.isActive
          ? "Verified product activated."
          : "Verified product deactivated.",

        data: product,
      });
    } catch (error) {
      console.error(
        "Toggle Verified Product Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update product status.",
      });
    }
  };