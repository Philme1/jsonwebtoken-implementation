const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator")
const User = require("../models/user");

const router = express.Router();

//Register route
router.post("/register", [
  check("name", "Name is Required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check('phonenumber').isMobilePhone(),
  check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

const { name, email, password, phonenumber } = req.body;

try {
  //check if user exists
  let user = await User.findOne({ email });
  if(user) {
    return res.status(400).json({ errors: [{msg: "User already Exists"}]})
  }

  //Adding a gravatar image;
  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: ""
  })

  user = new User({
    name,
    email,
    phonenumber,
    avatar,
    password
  })

  //Hashing the user password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt)

//Save the user to the Database
  await user.save();

const payload = {
  user: {
    id: user.id
  }
}

jwt.sign(payload, config.get("jwtSecret"), {expiresIn: 360000}, (err, token) => {
  if(err) throw err
  res.json({ token })
})

} catch (err) {
  console.log(err.message);
  res.status(500).send("Server Error")
}
})

module.exports = router;