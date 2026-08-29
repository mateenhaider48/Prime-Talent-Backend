import cloudinary from "../config/cloudinary.config.js";
import type { UploadApiResponse } from "cloudinary";
import type { Express } from "express";

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "media",
) => {
  try {
    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: "auto",
            },
            (
              error: any,
              result:
                | UploadApiResponse
                | undefined,
            ) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    "Cloudinary upload failed.",
                  ),
                );
                return;
              }

              resolve(result);
            },
          );

        stream.end(file.buffer);
      },
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType:
        result.resource_type,
    };
  } catch (error) {
    console.error(
      "Cloudinary Upload Error:",
      error,
    );

    throw new Error(
      "Failed to upload file to Cloudinary.",
    );
  }
};