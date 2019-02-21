const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const passport = require("passport");

//Bring in the User Model
let User = require("../models/user");

//Register Form Route
router.get("/register", (req, res) => {
  res.render("register");
});

//Register Process Route
router.post(
  "/register",
  //Validate that fields are not empty MIDDLEWARE
  [
    check("name", "Name is required").isLength({ min: 1 }),
    check("email", "Email is required").isLength({ min: 1 }),
    check("email", "Email is not valid").isEmail(),
    check("username", "Username is required").isLength({ min: 1 }),
    check("password", "Password is required").isLength({ min: 1 }),
    check("password2", "Please confirm password").custom(
      (value, { req, loc, path }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      }
    )
  ],
  (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render("register", {
        errors: errors.mapped()
      });
    } else {
      let newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        password2: password2
      });

      bcrypt.hash(newUser.password, 10, function(err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(err => {
          if (err) {
            console.log(err);
          } else {
            req.flash("success", "You are now registered and can log in");
            res.redirect("/users/login");
          }
        });
      });
    }
  }
);

//Login Route
router.get("/login", (req, res) => {
  res.render("login");
});

//Login Process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//Lougout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Your are logged out");
  res.redirect("/users/login");
});

module.exports = router;
