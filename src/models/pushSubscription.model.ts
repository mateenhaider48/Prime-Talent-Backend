import mongoose, { Document, Schema } from "mongoose";

export interface IPushSubscription extends Document {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema =
  new Schema<IPushSubscription>(
    {
      endpoint: {
        type: String,
        required: true,
        unique: true,
      },

      expirationTime: {
        type: Number,
        default: null,
      },

      keys: {
        p256dh: {
          type: String,
          required: true,
        },

        auth: {
          type: String,
          required: true,
        },
      },
    },
    {
      timestamps: true,
    }
  );

const PushSubscription =
  mongoose.model<IPushSubscription>(
    "PushSubscription",
    pushSubscriptionSchema
  );

export default PushSubscription;