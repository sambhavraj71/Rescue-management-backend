const express = require("express");
const router = express.Router();
const {
  registerUser, loginUser, deleteUser, getAllUsers,
  savePushToken, getUserProfile,
  updateEmergencyContacts, updateMedicalProfile,
  safeCheckIn, markFalseAlarm,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.post("/push-token", savePushToken);
router.get("/profile/:id", getUserProfile);
router.post("/emergency-contacts", updateEmergencyContacts);
router.post("/medical-profile", updateMedicalProfile);
router.post("/safe-checkin", safeCheckIn);
router.patch("/false-alarm/:sosId", markFalseAlarm);

module.exports = router;
