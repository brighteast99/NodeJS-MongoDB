const path = require("path");
const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");

router.get("/", (req, res) => {
  res.sendFile(path.resolve("./pages/index.html"));
});

router.get("/tasks/new", (req, res) => {
  res.sendFile(path.resolve("./pages/new.html"));
});

router.get("/tasks", (req, res) => {
  MongoDB.findAll("task")
    .then((tasks) => {
      res.render("list.ejs", { tasks: tasks });
    })
    .catch((err) => res.status(500).send());
});

module.exports = router;
