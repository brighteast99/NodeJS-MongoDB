const express = require("express");
const router = express.Router();

router.use("/", require("./page.routes"));

module.exports = router;
