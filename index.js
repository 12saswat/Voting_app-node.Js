const express = require("express");
require("dotenv").config();
const db = require("./db");
const port = process.env.PORT || 5000;

//Import the router file
const UserRoutes = require("./routes/userRoutes");

const candidateRoutes = require("./routes/candidateRoutes");

const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

//Use the router
app.use("/user", UserRoutes);
app.use("/candidate", candidateRoutes);

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
