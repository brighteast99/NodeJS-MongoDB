const express = require("express");
const { needLogin } = require("../modules/auth");
const router = express.Router();

router.use("/", require("./account.routes"));
router.use("/tasks", needLogin, require("./tasks.routes"));
router.use("/api", require("./api.routes"));
router.all("*", (req, res) => {
  res.status(404).render("404.ejs");
});

module.exports = router;
