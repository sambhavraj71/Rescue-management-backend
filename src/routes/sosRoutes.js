const express =
require("express");

const router =
express.Router();

const {

  createSOS,
  getAllSOS,
  getUserSOS,
  updateSOSStatus,
  getSOSAnalytics

} = require(
"../controllers/sosController"
);


// CREATE SOS

router.post(
  "/create",
  createSOS
);


// GET ALL SOS

router.get(
  "/all",
  getAllSOS
);

router.get(
  "/user/:userId",
  getUserSOS
);

router.get(
  "/analytics/summary",
  getSOSAnalytics
);

router.patch(
  "/:id/status",
  updateSOSStatus
);


module.exports =
router;
