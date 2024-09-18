const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("> Connected to MongoDB server");
});

db.on("error", (err) => {
  console.log("> MongoDB connected error:", err);
});

db.on("disconnected", () => {
  console.log("> MongoDB connected error:");
});

module.exports = db;
