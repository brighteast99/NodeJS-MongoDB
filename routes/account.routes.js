const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.ejs", { user: req.user });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");

  res.render("account_form.ejs", { registerMode: false });
});

router.get("/register", (req, res) => {
  res.render("account_form.ejs", { registerMode: true });
});

module.exports = router;
