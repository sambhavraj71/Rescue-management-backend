const express = require("express");
const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
   "/all-sos",
   protect,
   authorize("admin"),
   getAllSOS
);

module.exports = router;