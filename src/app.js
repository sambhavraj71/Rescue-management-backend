const express =
require("express");

const cors =
require("cors");

const authRoutes =
require("./routes/authRoutes");

const sosRoutes =
require("./routes/sosRoutes");

const rescueRoutes = require("./routes/rescueRoutes");

const app =
express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));

app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/sos",
  sosRoutes
);

app.use("/api/rescue", rescueRoutes);
module.exports = app;