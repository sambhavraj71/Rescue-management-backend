const SOS = require("../models/SOS");
const User = require("../models/User");

// GET all pending SOS for rescue team
exports.getPendingSOS = async (req, res) => {
  try {
    const data = await SOS.find({ status: { $in: ["pending", "assigned"] } })
      .sort({ createdAt: -1 })
      .populate("userId", "name email medicalProfile emergencyContacts");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET all SOS by rescue team name (active + completed)
exports.getMyActiveSOS = async (req, res) => {
  try {
    const { teamName } = req.params;
    const data = await SOS.find({
      assignedRescueTeamName: teamName,
      status: { $in: ["assigned", "accepted", "completed"] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "name email medicalProfile emergencyContacts");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Accept a SOS request
exports.acceptSOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName } = req.body;

    const sos = await SOS.findById(id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = "accepted";
    sos.assignedRescueTeamName = teamName;
    sos.statusHistory.push({
      status: "accepted",
      note: `Accepted by ${teamName}`,
      updatedBy: teamName,
      latitude: sos.latitude,
      longitude: sos.longitude,
    });

    await sos.save();

    const updated = await SOS.findById(id).populate("userId", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("sosUpdated", updated);
      io.emit("sosStatusUpdated", updated);
    }

    res.json({ message: "SOS Accepted", sos: updated });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update rescue team live location for a SOS
exports.updateRescueLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, teamName } = req.body;

    const sos = await SOS.findById(id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    const io = req.app.get("io");
    if (io) {
      io.emit("rescueLocationUpdated", {
        sosId: id,
        teamName,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    }

    res.json({ message: "Location broadcasted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Complete a SOS
exports.completeSOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, note = "Rescue completed" } = req.body;

    const sos = await SOS.findById(id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = "completed";
    sos.statusHistory.push({
      status: "completed",
      note,
      updatedBy: teamName,
      latitude: sos.latitude,
      longitude: sos.longitude,
    });

    await sos.save();

    const updated = await SOS.findById(id).populate("userId", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("sosUpdated", updated);
      io.emit("sosStatusUpdated", updated);
    }

    res.json({ message: "SOS Completed", sos: updated });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET all rescue teams (users with role rescue) + their active SOS count
exports.getRescueTeams = async (req, res) => {
  try {
    const teams = await User.find({ role: "rescue" }).select("name email");

    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const activeCount = await SOS.countDocuments({
          assignedRescueTeamName: team.name,
          status: { $in: ["assigned", "accepted"] },
        });
        const completedCount = await SOS.countDocuments({
          assignedRescueTeamName: team.name,
          status: "completed",
        });
        return {
          _id: team._id,
          name: team.name,
          email: team.email,
          activeCount,
          completedCount,
        };
      })
    );

    res.json(teamsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
