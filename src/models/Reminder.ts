import mongoose, { Schema } from "mongoose";

const slipSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Slip URL is required"],
      trim: true,
    },
  },

);

const paymentSchema = new Schema(
  {
    month: {
      type: String,
      required: [true, "Payment month is required"],
      trim: true,
    },
    slip: {
      type: [slipSchema],       // ✅ array of slip URLs
      default: [],
    },
  },

);

const reminderSchema = new Schema(
  {
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    senderReceiver: {
      type: String,
      required: [true, "Sender/Receiver is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    vendorAddress: {
      type: String,
      default: "",
      trim: true,
    },
    billingDate: {
      type: Date,
      required: [true, "Billing date is required"],
    },
    reminderType: {
      type: String,
      enum: ["EVERYDAY", "BEFORE_DAYS", "WEEKLY"],
      required: [true, "Reminder type is required"],
    },
    beforeDays: {
      type: Number,
      min: [0, "Days cannot be negative"],
      max: [30, "Days cannot be more than 30"],
      validate: {
        validator: function (this: any, v: number) {
          // Only required when reminderType is BEFORE_DAYS
          if (this.reminderType === "BEFORE_DAYS") {
            return v !== undefined && v !== null;
          }
          return true;
        },
        message: "beforeDays is required when reminderType is BEFORE_DAYS",
      },
    },
    timeOfDay: {
      type: String, // e.g. "09:00" (24-hour format)
      required: [true, "Time of day is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PENDING",
    },
    vendorStatus: {
      type: Boolean,
      default: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    agreement: {
      type: String, // URL or file path to agreement doc
      default: "",
      trim: true,
    },
    // ✅ Array of payments (each month can have multiple slips)
    payment: {
      type: [paymentSchema],
      default: [],
    },
    notificationCreated: {
      type: Boolean,
      default: false,
      required: true

    }
  },
  { timestamps: true }
);

export const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);
