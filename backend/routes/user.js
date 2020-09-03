const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const user = require("../models/user");

const router = express.Router();

router.post("/signup", (req, resp, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then((result) => {
        resp.status(201).json({
          message: "User created",
          result: result,
        });
      })
      .catch((err) => {
        resp.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/login", (req, resp, next) => {
  let fetchUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return resp.status(401).json({
          massage: "Authentification failed",
        });
      }
      fetchUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        resp.status(401).json({
          massage: "Authentification failed",
        });
      }
      const token = jwt.sign(
        {email: fetchUser.email, userId: fetchUser._id},
        'secret_dev_hashcode_longer_than_expected',
        { expiresIn: "1h" }
        );
        resp.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchUser._id
        });
    })
    .catch((err) => {
      resp.status(401).json({
        massage: "Authentification failed",
      });
    });
});

module.exports = router;
