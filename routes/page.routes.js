const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/login", (req, res) => {
  res.render("account_form.ejs", { registerMode: false });
});

router.get("/register", (req, res) => {
  res.render("account_form.ejs", { registerMode: true });
});

router.get("/tasks/new", (req, res) => {
  res.render("form.ejs", { createMode: true });
});

router.get("/tasks/:id/edit", (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).send();
  }

  MongoDB.findOne("task", { _id: _id })
    .then((task) => {
      if (!task) res.status(404).send();
      else res.render("form.ejs", { createMode: false, task: tas });
    })
    .catch(() => res.status(500).send());
});

router.get("/tasks", (req, res) => {
  MongoDB.findAll("task")
    .then((tasks) => res.render("list.ejs", { tasks: tasks }))
    .catch(() => res.status(500).send());
});

module.exports = router;
