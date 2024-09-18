const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtAuthMiddleware = (req, res, next) => {
  //first check request headers has authorixzation or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(404).json({ error: "Token not found" });

  //extract the jwt token from the request heders
  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    //verify the jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Atach user information to the request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Invalid token" });
  }
};

const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET);
};

module.exports = { jwtAuthMiddleware, generateToken };
