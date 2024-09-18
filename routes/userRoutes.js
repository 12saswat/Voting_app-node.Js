const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { jwtAuthMiddleware, generateToken } = require("../jwt");

//To get all the user
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const Admin = await User.findById(id);

  const payload = {
    id: User.id,
  };
  const token = generateToken(payload);
  return res.status(200).json({ Admin: Admin, token: token });
});

router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //assuming the request body contains the User data

    //create anew user document using the Mongoose model
    const newUser = new User(data);

    //Condotion for admin that have only one user
    if (newUser.role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin)
        return res.status(402).json({ msg: "Admin already exists" });
    }
    //save the new user to the database
    const response = await newUser.save();
    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);

    return res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});

//Login Route
router.post("/login", async (req, res) => {
  try {
    //Extract the adharcard number and passsword from request body
    const { aadharCardNumber, password } = req.body;

    //find user by adhar card number
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //if user does not exist or password does not match , return error
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "invalid Adhar number or password" });
    }

    //genarate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Profile user
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user; //it hold the req user data from the token
    const userId = userData.id;
    const user = await User.findById(userId);

    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ err: "Internal Server Error" });
  }
});

//To update the password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //Extraxt the id from the token
    const { currentPassword, newPassword } = req.body; //Extract the old password and current password

    //find user by adhar card number
    const user = await User.findById(userId);

    //if password does not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res
        .status(401)
        .json({ error: "invalid Adhar number or password" });
    }

    //update the user's password
    user.password = newPassword;
    await user.save();

    console.log("password changed");
    res.status(200).json({ message: "Password changed" });
  } catch (err) {
    return res.status(500).json({ Error: "Internal server Error" });
  }
});

module.exports = router;
