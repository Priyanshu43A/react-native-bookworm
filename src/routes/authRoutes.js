import express from "express";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ msg: "The username needs to be at least 3 characters long." });
    }

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already exists." });
    }
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username already exists." });
    }

    //get random avatar
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    //create new user
    const newUser = new User({
      username,
      email,
      password,
      profileImage: avatar,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }
    //check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credientals" });
    }
    //check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credientals." });
    }
    //generate token
    const token = generateToken(user._id);
    res
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error!" });
    console.error(error);
  }
});

export default router;
