const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashpassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      password: hashpassword,
    });
    //  req.session.user = newUser;
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.tatus(404).json({
        status: "failed",
        message: "user not found",
      });
      return;
    }
    const isPassword = await bcrypt.compare(password, user.password);

    if (isPassword) {
      //req.session.user = user;
      res.status(201).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "failed",
        message: "Incorrect password",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "failed",
    });
  }
};
