const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../controllers/users_controller");
const { wrapAsync } = require("../util/helper");

//create new user for register
router.post("/register", wrapAsync(usersController.create));

// Show register page for new user
router.get("/register", usersController.showRegistration);

// Display a Login page to the user
router.get("/login", usersController.showLogin);

// Login a user
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  usersController.login
);

router.get("/logout", usersController.logout);

module.exports = { router };
