const express = require("express");
const { needLogin } = require("../modules/auth");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("index.ejs", { user: req.user });
});
router.use("/", require("./pages"));
router.use("/api", require("./apis"));
router.all("*", (req, res) => {
	res.status(404).render("404.ejs");
});

module.exports = router;
