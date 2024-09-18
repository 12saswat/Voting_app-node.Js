const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userScema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});
userScema.pre("save", async function (next) {
  const user = this;

  //Hash the password only if it has been modified (or new)
  if (!user.isModified("password")) return next();
  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);

    //hash password
    const hashPassword = await bcrypt.hash(user.password, salt);

    //Override the plain password with the hashed one
    user.password = hashPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

userScema.methods.comparePassword = async function (candidatePassword) {
  try {
    //use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("user", userScema);

module.exports = User;
