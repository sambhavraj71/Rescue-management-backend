require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");

const http = require("http");

connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Socket Connection
io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  // NEW SOS EVENT
  socket.on("sendSOS", (data) => {

    console.log("SOS Received:", data);

    // Send to all admins/rescue teams
    io.emit("newSOS", data);
  });

  // LIVE LOCATION UPDATE
  socket.on("liveLocation", (data) => {

    io.emit("locationUpdated", data);
  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("User Disconnected");

  });

});

// Start Server
server.listen(PORT, () => {

  console.log(`Server Running on ${PORT}`);

});