const SOS = require("../models/SOS");

const VALID_STATUS = ["pending", "assigned", "accepted", "completed"];

exports.createSOS = async (req, res) => {
  try {
    const {
      userId,
      emergencyType,
      latitude,
      longitude,
      notes = "",
      imageUrl = "",
      voiceEmergency = false,
    } = req.body;

    if (!userId || !emergencyType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sos = await SOS.create({
      userId,
      emergencyType,
      latitude,
      longitude,
      notes,
      imageUrl,
      voiceEmergency,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          note: notes || "SOS created",
          updatedBy: "user",
          latitude,
          longitude,
        },
      ],
    });

    const populatedSOS = await SOS.findById(sos._id)
      .populate("userId", "name email")
      .populate("assignedRescueTeam", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("sosCreated", populatedSOS);
      io.emit("sosUpdated", populatedSOS);
    }

    res.status(201).json({
      message: "SOS Created",
      sos: populatedSOS,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getAllSOS = async (req, res) => {
  try {
    const data = await SOS.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("assignedRescueTeam", "name email");

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getUserSOS = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await SOS.find({ userId })
      .sort({ createdAt: -1 })
      .populate("assignedRescueTeam", "name email")
      .limit(30);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = "", assignedRescueTeamName = "", latitude, longitude } = req.body;

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const sos = await SOS.findById(id);

    if (!sos) {
      return res.status(404).json({ message: "SOS not found" });
    }

    sos.status = status;

    if (assignedRescueTeamName) {
      sos.assignedRescueTeamName = assignedRescueTeamName;
    }

    if (latitude !== undefined) {
      sos.latitude = latitude;
    }

    if (longitude !== undefined) {
      sos.longitude = longitude;
    }

    sos.statusHistory.push({
      status,
      note,
      updatedBy: assignedRescueTeamName || "rescue-team",
      latitude: latitude !== undefined ? latitude : sos.latitude,
      longitude: longitude !== undefined ? longitude : sos.longitude,
    });

    await sos.save();

    const updatedSOS = await SOS.findById(id)
      .populate("userId", "name email")
      .populate("assignedRescueTeam", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("sosStatusUpdated", updatedSOS);
      io.emit("sosUpdated", updatedSOS);
    }

    res.json({ message: "Status updated", sos: updatedSOS });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSOSAnalytics = async (req, res) => {
  try {
    const [statusCounts, emergencyTypeCounts, totalSOS, recentSOS, heatmapPoints] = await Promise.all([
      SOS.aggregate([
        { $group: { _id: { $ifNull: ["$status", "pending"] }, count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      SOS.aggregate([
        { $group: { _id: "$emergencyType", count: { $sum: 1 } } },
        { $project: { _id: 0, type: "$_id", count: 1 } },
      ]),
      SOS.countDocuments(),
      SOS.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      SOS.find({}, "latitude longitude emergencyType status createdAt").sort({ createdAt: -1 }).limit(250),
    ]);

    res.json({
      totalSOS,
      recentSOS,
      statusCounts,
      emergencyTypeCounts,
      heatmapPoints,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
