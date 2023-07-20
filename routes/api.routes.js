const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;
const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const encrypt = require("../modules/auth/encrypt");

router.post("/login", passport.authenticate("local"), function (req, res) {
  res.redirect("/");
});

router.post("/register", (req, res) => {
  if (!req.body.id || !req.body.password) return res.status(400).send();

  MongoDB.findAll("user", { id: req.body.id })
    .then((result) => {
      if (result.length > 0) return res.status(409).send();

      const newUser = {
        id: req.body.id,
        password: req.body.password,
        salt: bcrypt.genSaltSync(10),
      };
      newUser.password = encrypt(newUser.password, newUser.salt);

      MongoDB.insertOne("user", newUser).then(() => res.status(200).send());
    })
    .catch(() => res.status(500).send());
});

router.post("/tasks", (req, res) => {
  if (!req.body.taskName || !req.body.taskDueDate)
    return res.status(400).send();

  const newTask = {
    name: req.body.taskName,
    dueDate: req.body.taskDueDate,
  };

  MongoDB.insertOne("task", newTask)
    .then(() => res.redirect("/tasks/new"))
    .catch(() => res.status(500).send());
});

router.put("/tasks/:id", (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).send();
  }

  if (!req.body.taskName || !req.body.taskDueDate)
    return res.status(400).send();

  const toUpdate = {
    name: req.body.taskName,
    dueDate: req.body.taskDueDate,
  };

  MongoDB.updateOne("task", { _id: _id }, toUpdate)
    .then(() => res.redirect("/tasks"))
    .catch(() => res.status(500).send());
});

router.delete("/tasks/:id", (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).send();
  }

  MongoDB.deleteOne("task", { _id: _id })
    .then((result) => res.send(result))
    .catch(() => res.status(500).send());
});

module.exports = router;
