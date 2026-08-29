import mongoose, {
  Document,
  Schema,
} from "mongoose";

// ============================================================
// INTERFACE
// ============================================================

export interface IVerifiedProduct
  extends Document {
  brandName: string;

  productName: string;

  description: string;

  couponCode?: string;

  discount?: string;

  storeLink: string;

  productImage?: string;

  productVideo?: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================
// SCHEMA
// ============================================================

const verifiedProductSchema =
  new Schema<IVerifiedProduct>(
    {
      // ======================================================
      // BRAND
      // ======================================================

      brandName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      // ======================================================
      // PRODUCT
      // ======================================================

      productName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      // ======================================================
      // DESCRIPTION
      // ======================================================

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      // ======================================================
      // COUPON CODE
      // ======================================================

      couponCode: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 50,
      },

      // ======================================================
      // DISCOUNT
      // Example:
      // "10% Off"
      // "20% Off"
      // ======================================================

      discount: {
        type: String,
        trim: true,
        maxlength: 50,
      },

      // ======================================================
      // STORE LINK
      // ======================================================

      storeLink: {
        type: String,
        required: true,
        trim: true,
      },

      // ======================================================
      // PRODUCT IMAGE
      // ======================================================

      productImage: {
        type: String,
        trim: true,
      },

      // ======================================================
      // PRODUCT VIDEO
      // OPTIONAL
      // ======================================================

      productVideo: {
        type: String,
        trim: true,
      },

      // ======================================================
      // ACTIVE / INACTIVE
      // ======================================================

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  );

// ============================================================
// INDEX
// ============================================================

verifiedProductSchema.index({
  isActive: 1,
});

verifiedProductSchema.index({
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const VerifiedProduct =
  mongoose.model<IVerifiedProduct>(
    "VerifiedProduct",
    verifiedProductSchema,
  );

export default VerifiedProduct;