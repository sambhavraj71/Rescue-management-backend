const mongoose =
require("mongoose");

const sosSchema =
new mongoose.Schema({

  userId:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User",

    required:true

  },

  emergencyType:{

    type:String,

    required:true

  },

  latitude:{

    type:Number,

    required:true

  },

  longitude:{

    type:Number,

    required:true

  }

},{
  timestamps:true,
    status: {
    type: String,
    enum: ["pending", "assigned", "accepted", "completed"],
    default: "pending",
  },

  assignedRescueTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports =
mongoose.model(
  "SOS",
  sosSchema
);