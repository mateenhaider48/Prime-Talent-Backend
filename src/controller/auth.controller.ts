import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import {
  generateToken,
  genRefreshToken,
} from "../utils/generateToken.js"

// ============================================================
// REGISTER ADMIN
// ============================================================

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, email, password } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // ========================================================
    // NORMALIZE EMAIL
    // ========================================================

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ========================================================
    // CHECK EXISTING ADMIN
    // ========================================================

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    // ========================================================
    // CREATE ADMIN
    // ========================================================

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering admin.",
    });
  }
};

// ============================================================
// LOGIN ADMIN
// ============================================================

export const loginUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ========================================================
    // FIND ADMIN
    // ========================================================

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ========================================================
    // MAKE SURE USER IS ADMIN
    // ========================================================

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin account required.",
      });
    }

    // ========================================================
    // CHECK PASSWORD
    // ========================================================

    const isMatched = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ========================================================
    // GENERATE TOKENS
    // ========================================================

    const accessToken = generateToken(
      user._id,
      user.role,
    );

    const refreshToken = genRefreshToken(
      user._id,
      user.role,
    );

    // ========================================================
    // ACCESS TOKEN COOKIE
    // ========================================================

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 24 * 60 * 1000, // 15 minutes
    });

    // ========================================================
    // REFRESH TOKEN COOKIE
    // ========================================================

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        token: accessToken,
      },
    });
  } catch (error) {
    console.error("Login Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
};

// ============================================================
// LOGOUT ADMIN
// ============================================================

export const logoutUser = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging out.",
    });
  }
};

// ============================================================
// GET CURRENT ADMIN
// ============================================================

export const getMe = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // auth middleware se user ID aayegi
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const user = await User.findById(userId).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ============================================================
// CHANGE ADMIN PASSWORD
// ADMIN CAN CHANGE ONLY HIS OWN PASSWORD
// ============================================================

export const changeAdminPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // ========================================================
    // GET ADMIN ID FROM AUTH MIDDLEWARE
    // ========================================================

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    // ========================================================
    // GET PASSWORDS
    // ========================================================

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required.",
      });
    }

    // ========================================================
    // NEW PASSWORD LENGTH
    // ========================================================

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters.",
      });
    }

    // ========================================================
    // CHECK NEW PASSWORD MATCH
    // ========================================================

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    // ========================================================
    // FIND ADMIN
    // ========================================================

    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // ========================================================
    // MAKE SURE USER IS ADMIN
    // ========================================================

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Admin account required.",
      });
    }

    // ========================================================
    // CHECK CURRENT PASSWORD
    // ========================================================

    const isCurrentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        admin.password,
      );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // ========================================================
    // PREVENT SAME PASSWORD
    // ========================================================

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        admin.password,
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password.",
      });
    }

    // ========================================================
    // HASH NEW PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10,
    );

    // ========================================================
    // UPDATE PASSWORD
    // ========================================================

    admin.password = hashedPassword;

    await admin.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Admin password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Change Admin Password Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing password.",
    });
  }
};