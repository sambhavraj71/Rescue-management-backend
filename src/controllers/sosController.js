const SOS =
require("../models/SOS");

exports.createSOS =
async(req,res)=>{

  try {

    const sos =
    await SOS.create(req.body);

    res.status(201).json({

      message:
      "SOS Created",

      sos

    });

  } catch(error){

    console.log(error);

    res.status(500).json({

      message:
      "Server Error"

    });

  }

};

exports.getAllSOS =
async(req,res)=>{

  try {

    const data =
    await SOS.find()

    .populate(
      "userId",
      "name email"
    );

    res.json(data);

  } catch(error){

    console.log(error);

    res.status(500).json({

      message:
      "Server Error"

    });

  }

};