const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "rescue", "admin"],
    default: "user",
  },
  // Push notification token
  expoPushToken: { type: String, default: "" },
  // Emergency contacts
  emergencyContacts: [
    {
      name: { type: String },
      phone: { type: String },
    },
  ],
  // Medical profile
  medicalProfile: {
    bloodGroup:  { type: String, default: "" },
    allergies:   { type: String, default: "" },
    conditions:  { type: String, default: "" },
    medications: { type: String, default: "" },
  },
  // Safe check-in
  isSafe: { type: Boolean, default: false },
  safeCheckedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
