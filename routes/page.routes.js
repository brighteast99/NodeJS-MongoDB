const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.resolve("./pages/index.html"));
});

router.get("/new", (req, res) => {
  res.sendFile(path.resolve("./pages/new.html"));
});

module.exports = router;
