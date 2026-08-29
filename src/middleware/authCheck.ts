import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

 interface AuthPayload extends JwtPayload {
  id: string;
  role: "admin";
}
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "admin";
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    // Get access token
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        message: "Access token missing",
      });
    }
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET as Secret
      ) as AuthPayload;
      
      req.user = decoded;
      return next();
    } catch {
      // Access token expired
      const refreshToken = req.cookies?.refreshToken;
       
      if (!refreshToken) {
        return res.status(401).json({
          message: "Refresh token missing",
        });
      }
    
      try {
       
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET as Secret
        ) as AuthPayload;
        
        const newAccessToken = jwt.sign(
          {
            id: decodedRefresh.id,
            role: decodedRefresh.role,
          },
          process.env.JWT_SECRET as Secret,
          {
            expiresIn:
              process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
          }
        );
        
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        req.user = decodedRefresh;

        return next();
      } catch(error:any) {
        console.error("Refresh Token Error:", error);
        return res.status(403).json({
          message: "Refresh token expired or invalid",
        });
      }
    }
  } catch {
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

export const authorized =
  (...authorizedRoles: ("user" | "admin")[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const role = req.user?.role;

    if (!role || !authorizedRoles.includes(role)) {
      return res.status(403).json({
        message: "Forbidden: Access denied!",
      });
    }

    next();
  };

export default authCheck;