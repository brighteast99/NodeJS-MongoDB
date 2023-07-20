const express = require("express");
const router = express.Router();

router.use("/", require("./page.routes"));
router.use("/api", require("./api.routes"));
router.all("*", (req, res) => {
  res.status(404).render("404.ejs");
});

module.exports = router;
