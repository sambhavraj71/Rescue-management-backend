const User = require("../models/User");
const SOS = require("../models/SOS");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendPush = require("../utils/sendPush");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || "user" });
    res.status(201).json({ message: "User Registered", token: generateToken(user._id), user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });
    res.status(200).json({ message: "Login Success", token: generateToken(user._id), user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Save Expo push token
const savePushToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    await User.findByIdAndUpdate(userId, { expoPushToken: token });
    res.json({ message: "Token saved" });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(200).json({});
    res.json(user);
  } catch (e) {
    res.status(200).json({});
  }
};

// Update emergency contacts
const updateEmergencyContacts = async (req, res) => {
  try {
    const { userId, contacts } = req.body;
    await User.findByIdAndUpdate(userId, { emergencyContacts: contacts });
    res.json({ message: "Emergency contacts updated" });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update medical profile
const updateMedicalProfile = async (req, res) => {
  try {
    const { userId, medicalProfile } = req.body;
    await User.findByIdAndUpdate(userId, { medicalProfile });
    res.json({ message: "Medical profile updated" });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Safe check-in
const safeCheckIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isSafe: true, safeCheckedAt: new Date() },
      { new: true }
    ).select("-password");

    // Notify emergency contacts via push if they have tokens
    // (This is a placeholder — in real app you'd send SMS via free service like TextBelt)
    const io = req.app.get("io");
    if (io) io.emit("userSafeCheckIn", { userId, userName: user.name, time: new Date() });

    res.json({ message: "Safe check-in recorded", user });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark SOS as false alarm
const markFalseAlarm = async (req, res) => {
  try {
    const { sosId } = req.params;
    const sos = await SOS.findByIdAndUpdate(
      sosId,
      {
        isFalseAlarm: true,
        status: "completed",
        $push: {
          statusHistory: {
            status: "completed",
            note: "Marked as false alarm by user",
            updatedBy: "user",
          },
        },
      },
      { new: true }
    );
    const io = req.app.get("io");
    if (io) { io.emit("sosUpdated", sos); io.emit("sosStatusUpdated", sos); }
    res.json({ message: "Marked as false alarm", sos });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser, loginUser, deleteUser, getAllUsers,
  savePushToken, getUserProfile,
  updateEmergencyContacts, updateMedicalProfile,
  safeCheckIn, markFalseAlarm,
};
