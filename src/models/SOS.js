const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emergencyType: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "accepted", "completed"],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    voiceEmergency: {
      type: Boolean,
      default: false,
    },

    assignedRescueTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedRescueTeamName: {
      type: String,
      default: "",
    },

    isFalseAlarm: { type: Boolean, default: false },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "assigned", "accepted", "completed"],
          required: true,
        },
        note: {
          type: String,
          default: "",
        },
        updatedBy: {
          type: String,
          default: "system",
        },
        latitude: Number,
        longitude: Number,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SOS", sosSchema);
