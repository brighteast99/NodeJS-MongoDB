const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/tasks/new", (req, res) => {
  res.render("new.ejs");
});

router.get("/tasks/:id/edit", (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).send();
  }

  MongoDB.findAll("task", { _id: _id })
    .then((task) => {
      if (!task.length) res.status(404).send();
      else res.render("edit.ejs", { task: task[0] });
    })
    .catch(() => res.status(500).send());
});

router.get("/tasks", (req, res) => {
  MongoDB.findAll("task")
    .then((tasks) => res.render("list.ejs", { tasks: tasks }))
    .catch(() => res.status(500).send());
});

router.get("*", (req, res) => {
  res.status(404).render("404.ejs");
});

module.exports = router;
