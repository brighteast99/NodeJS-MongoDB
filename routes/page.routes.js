const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/tasks/new", (req, res) => {
  res.render("new.ejs");
});

router.get("/tasks", (req, res) => {
  MongoDB.findAll("task")
    .then((tasks) => {
      res.render("list.ejs", { tasks: tasks });
    })
    .catch((err) => res.status(500).send());
});

module.exports = router;
