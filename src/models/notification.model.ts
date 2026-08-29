import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface INotification extends Document {
  type: "advertisement" | "product";
  title: string;
  message: string;
  referenceId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema =
  new Schema<INotification>(
    {
      type: {
        type: String,
        enum: ["advertisement", "product"],
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      referenceId: {
        type: Schema.Types.ObjectId,
        default: null,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );

export default Notification;