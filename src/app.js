const express =
require("express");

const cors =
require("cors");

const authRoutes =
require("./routes/authRoutes");

const sosRoutes =
require("./routes/sosRoutes");

const app =
express();

app.use(cors());

app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/sos",
  sosRoutes
);

module.exports = app;