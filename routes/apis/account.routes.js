const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;
const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const { SALT_ROUNDS, hash, needLogin } = require("../../modules/auth");

router.post("/login", passport.authenticate("local"), (req, res) => {
	if (req.body.remember) {
		req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
	} else {
		req.session.cookie.expires = false;
	}
	res.redirect("/");
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error(err);
			return res.redirect("/");
		}
		res.clearCookie("connect.sid");
		res.redirect("/");
	});
});

router.post("/register", (req, res) => {
	if (!req.body.id || !req.body.password) return res.status(400).send();

	MongoDB.findOne("user", { id: req.body.id })
		.then((result) => {
			if (result) return res.status(409).send();

			const newUser = {
				id: req.body.id,
				name: req.body.id,
				password: req.body.password,
				salt: bcrypt.genSaltSync(SALT_ROUNDS),
			};
			newUser.password = hash(newUser.password, newUser.salt);

			MongoDB.insertOne("user", newUser).then(() => res.status(200).send());
		})
		.catch(() => res.status(500).send());
});

module.exports = router;
