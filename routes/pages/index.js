const express = require("express");
const { needLogin } = require("../../modules/auth");
const router = express.Router();

router.use("/", require("./account.routes"));
router.use("/tasks", needLogin, require("./tasks.routes"));

module.exports = router;
