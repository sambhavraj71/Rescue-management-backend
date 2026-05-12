const express =
require("express");

const router =
express.Router();

const {

  createSOS,
  getAllSOS

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


module.exports =
router;