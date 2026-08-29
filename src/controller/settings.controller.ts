import { Request, Response } from "express";
import Settings from "../models/settings.model.js";

// ============================================================
// GET SETTINGS
// Public route — footer/whatsapp button ke liye
// ============================================================

export const getSettings = async (
  req: Request,
  res: Response,
) => {
  try {
    let settings = await Settings.findOne();

    // Agar pehli baar hai aur document exist nahi karta,
    // to empty default document bana dein

    if (!settings) {
      settings = await Settings.create({
        whatsapp: "",
        facebook: "",
        instagram: "",
        linkedin: "",
      });
    }

    return res.status(200).json({
      message: "Settings fetched successfully.",
      data: settings,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to fetch settings.",
    });
  }
};

// ============================================================
// UPDATE SETTINGS
// Admin only
// ============================================================

export const updateSettings = async (
  req: Request,
  res: Response,
) => {
  try {
    const { whatsapp, facebook, instagram, linkedin } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        whatsapp: whatsapp || "",
        facebook: facebook || "",
        instagram: instagram || "",
        linkedin: linkedin || "",
      });
    } else {
      if (whatsapp !== undefined) settings.whatsapp = whatsapp;
      if (facebook !== undefined) settings.facebook = facebook;
      if (instagram !== undefined) settings.instagram = instagram;
      if (linkedin !== undefined) settings.linkedin = linkedin;

      await settings.save();
    }

    return res.status(200).json({
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to update settings.",
    });
  }
};