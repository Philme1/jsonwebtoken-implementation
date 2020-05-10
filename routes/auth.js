const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const auth = require("../middleware/auth")
const { check, validationResult } = require("express-validator")

const User = require("../models/user");

router.get("/", auth, async (req, res) => {
  try {
    const user = User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});


//Login Route
router.post("/login", [
      check("email", "Please include a valid email").isEmail(),
      check("password", "Please password is required").exists()
    ], async (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }


    const { email, password } = req.body;

    try {
      //check if user exists
      let user = await User.findOne({ email: email });
      if(!user) {
        return res.status(400).json({ errors: [{msg: "Invalid Credentials"}]})
      }

      
      const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
          return res.status(400).json({errors: [{ msg: "Invalid Credentials" }] })
        }


    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(payload, config.get("jwtSecret"), {expiresIn: 360000}, (err, token) => {
      if(err) throw err
      res.json({ token })
    });

      // res.json(user);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error")
    }
})

module.exports = router;