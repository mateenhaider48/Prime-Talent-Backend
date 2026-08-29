import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

type UserRole = "user" | "admin";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined in .env");
}

export const generateToken = (
  userId: Types.ObjectId | string,
  role: UserRole
): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "30d";

  return jwt.sign(
    {
      id: userId.toString(),
      role,
    },
    JWT_SECRET as Secret,
    {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    }
  );
};

export const genRefreshToken = (
  userId: Types.ObjectId | string,
  role: UserRole
): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "60d";

  return jwt.sign(
    {
      id: userId.toString(),
      role,
    },
    JWT_REFRESH_SECRET as Secret,
    {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    }
  );
};