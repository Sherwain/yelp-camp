const User = require("../models/User");

async function create(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    req.login(newUser, (error) => {
      if (error) return next(error);
      req.flash("success", `Welcome to Yel Camp, ${newUser.username}!`);
      res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
}

function showRegistration(req, res) {
  res.render("users/register");
}

function showLogin(req, res) {
  res.render("users/login");
}

function login(req, res) {
  const url = req.session.origURL || "/campgrounds";
  delete req.session.origURL;
  req.flash("success", `Welcome back, ${req.user.username}!`);
  res.redirect(url);
}

function logout(req, res) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
}

module.exports = { create, showRegistration, showLogin, login, logout };
