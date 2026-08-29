import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// INTERFACE
// ============================================================

export interface ISettings extends Document {
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// SCHEMA
// ============================================================

const settingsSchema = new Schema<ISettings>(
  {
    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },

    facebook: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// MODEL
// ============================================================

const Settings = mongoose.model<ISettings>(
  "Settings",
  settingsSchema,
);

export default Settings;