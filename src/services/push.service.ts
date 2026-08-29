import webpush from "../config/webPush.js";
import PushSubscription from "../models/pushSubscription.model.js";

interface PushPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  badge?: string;
}

export const sendPushNotification =
  async (
    payload: PushPayload
  ): Promise<void> => {
    const subscriptions =
      await PushSubscription.find();

    const notificationPayload =
      JSON.stringify({
        title: payload.title,
        message: payload.message,
        url: payload.url || "/",
        icon:
          payload.icon ||
          "/icons/notification-icon.png",
        badge:
          payload.badge ||
          "/icons/notification-badge.png",
      });

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,

            expirationTime:
              subscription.expirationTime,

            keys: {
              p256dh:
                subscription.keys.p256dh,

              auth:
                subscription.keys.auth,
            },
          },
          notificationPayload
        );

        console.log(
          "🔔 Notification sent:",
          subscription.endpoint
        );
      } catch (error: any) {
        console.error(
          "Push notification error:",
          error
        );

        // Subscription expired / invalid
        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          await PushSubscription.deleteOne({
            _id: subscription._id,
          });

          console.log(
            "🗑️ Invalid push subscription removed"
          );
        }
      }
    }
  };