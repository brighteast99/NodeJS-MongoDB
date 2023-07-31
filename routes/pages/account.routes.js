const express = require("express");
const { needLogin } = require("../../modules/auth");
const router = express.Router();

router.get("/login", (req, res) => {
	if (req.isAuthenticated()) return res.redirect("/");

	res.render("account_form.ejs", { registerMode: false });
});

router.get("/register", (req, res) => {
	res.render("account_form.ejs", { registerMode: true });
});

router.get("/my", needLogin, (req, res) => {
	res.render("myPage.ejs", { user: req.user });
});

module.exports = router;
