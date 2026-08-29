import { Request, Response } from "express";

import PushSubscription from "../models/pushSubscription.model.js";

import {
  sendPushNotification,
} from "../services/push.service.js";

// ============================================================
// SAVE ADMIN PUSH SUBSCRIPTION
// ============================================================

export const subscribeToPush =
  async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const {
        endpoint,
        expirationTime,
        keys,
      } = req.body;

      if (
        !endpoint ||
        !keys?.p256dh ||
        !keys?.auth
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid push subscription.",
        });
      }

      const subscription =
        await PushSubscription.findOneAndUpdate(
          {
            endpoint,
          },
          {
            endpoint,
            expirationTime:
              expirationTime ?? null,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Push subscription saved successfully.",
        data: subscription,
      });
    } catch (error) {
      console.error(
        "Subscribe Push Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save push subscription.",
      });
    }
  };

// ============================================================
// GET VAPID PUBLIC KEY
// ============================================================

export const getVapidPublicKey =
  async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        success: true,
        publicKey:
          process.env.VAPID_PUBLIC_KEY,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to get VAPID public key.",
      });
    }
  };

// ============================================================
// DELETE PUSH SUBSCRIPTION
// ============================================================

export const unsubscribeFromPush =
  async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({
          success: false,
          message: "Endpoint is required.",
        });
      }

      await PushSubscription.deleteOne({
        endpoint,
      });

      return res.status(200).json({
        success: true,
        message:
          "Push subscription removed.",
      });
    } catch (error) {
      console.error(
        "Unsubscribe Push Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to unsubscribe.",
      });
    }
  };

// ============================================================
// TEST PUSH NOTIFICATION
// ADMIN ONLY
// ============================================================

export const sendTestPush =
  async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      await sendPushNotification({
        title: "Test Notification 🔔",
        message:
          "Web Push notification is working successfully!",
        url: "/admin/dashboard",
      });

      return res.status(200).json({
        success: true,
        message:
          "Test push notification sent.",
      });
    } catch (error) {
      console.error(
        "Test Push Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send test notification.",
      });
    }
  };