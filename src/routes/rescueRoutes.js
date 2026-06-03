const express = require("express");
const router = express.Router();

const {
  getPendingSOS,
  getMyActiveSOS,
  acceptSOS,
  updateRescueLocation,
  completeSOS,
  getRescueTeams,
} = require("../controllers/rescueController");

router.get("/pending", getPendingSOS);
router.get("/my-active/:teamName", getMyActiveSOS);
router.post("/accept/:id", acceptSOS);
router.post("/location/:id", updateRescueLocation);
router.post("/complete/:id", completeSOS);
router.get("/teams", getRescueTeams);

module.exports = router;
