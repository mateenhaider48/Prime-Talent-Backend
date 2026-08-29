import mongoose, {
  Document,
  Schema,
} from "mongoose";

// ============================================================
// TYPES
// ============================================================

export type AdvertisementType =
  | "professional"
  | "product";

export type AdvertisementStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "completed";

// ============================================================
// PROFESSIONAL PROFILE LINK
// ============================================================

export interface IProfileLink {
  title: string;
  url: string;
}

// ============================================================
// ADVERTISEMENT REQUEST
// ============================================================

export interface IAdvertisementRequest
  extends Document {
  type: AdvertisementType;

  // ==========================================================
  // COMMON
  // ==========================================================

  email?: string;

  // ==========================================================
  // PROFESSIONAL PROMOTION
  // ==========================================================

  completeName?: string;

  professionalTitle?: string;

  photoOrLogo?: string;

  bio?: string;

  writeBioForMe?: boolean;

  profileLinks?: IProfileLink[];

  // ==========================================================
  // PRODUCT PROMOTION
  // ==========================================================

  brandBusinessName?: string;

  productNameDetails?: string;
  productSubCategory?: string;  
  productStoreLink?: string;

  productImage?: string;

  productVideo?: string;

  wantsToProceed?: boolean;

  // ==========================================================
  // ADMIN
  // ==========================================================

  status: AdvertisementStatus;

  adminNote?: string;

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================
// PROFILE LINK SCHEMA
// ============================================================

const profileLinkSchema =
  new Schema<IProfileLink>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      url: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

// ============================================================
// MAIN SCHEMA
// ============================================================

const advertisementRequestSchema =
  new Schema<IAdvertisementRequest>(
    {
      // ======================================================
      // REQUEST TYPE
      // ======================================================

      type: {
        type: String,
        enum: [
          "professional",
          "product",
        ],
        required: true,
      },

      // ======================================================
      // COMMON EMAIL
      // ======================================================

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      // ======================================================
      // PROFESSIONAL PROMOTION
      // ======================================================

      completeName: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      professionalTitle: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      photoOrLogo: {
        type: String,
        trim: true,
      },

      bio: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      writeBioForMe: {
        type: Boolean,
        default: false,
      },

      profileLinks: {
        type: [profileLinkSchema],

        validate: {
          validator: function (
            links: IProfileLink[],
          ) {
            return links.length <= 5;
          },

          message:
            "Maximum 5 profile links are allowed.",
        },
      },

      // ======================================================
      // PRODUCT PROMOTION
      // ======================================================

      brandBusinessName: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      productNameDetails: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
       productSubCategory: {
        type: String,
        trim: true,
      },

      productStoreLink: {
        type: String,
        trim: true,
      },

      productImage: {
        type: String,
        trim: true,
      },

      productVideo: {
        type: String,
        trim: true,
      },

      wantsToProceed: {
        type: Boolean,
        default: false,
      },

      // ======================================================
      // ADMIN
      // ======================================================

      status: {
        type: String,
        enum: [
          "pending",
          "reviewing",
          "approved",
          "rejected",
          "completed",
        ],
        default: "pending",
      },

      adminNote: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },
    {
      timestamps: true,
    },
  );

// ============================================================
// INDEXES
// ============================================================

advertisementRequestSchema.index({
  type: 1,
});

advertisementRequestSchema.index({
  status: 1,
});

advertisementRequestSchema.index({
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const AdvertisementRequest =
  mongoose.model<IAdvertisementRequest>(
    "AdvertisementRequest",
    advertisementRequestSchema,
  );

export default AdvertisementRequest;