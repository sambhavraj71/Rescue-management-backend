const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get(
   "/dashboard",
   protect,
   authorize("rescue"),
   (req,res)=>{
      res.json({
         success:true,
         message:"Rescue Dashboard"
      })
   }
);

module.exports = router;