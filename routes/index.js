const express = require("express");
const router = express.Router();

router.use("/", require("./page.routes"));
router.use("/api", require("./api.routes"));

module.exports = router;
