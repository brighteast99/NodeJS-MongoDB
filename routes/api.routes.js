const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;
const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const { SALT_ROUNDS, hash, needLogin } = require("../modules/auth");

router.post("/login", passport.authenticate("local"), (req, res) => {
  if (req.body.remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  } else {
    req.session.cookie.expires = false;
  }
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

router.post("/register", (req, res) => {
  if (!req.body.id || !req.body.password) return res.status(400).send();

  MongoDB.findOne("user", { id: req.body.id })
    .then((result) => {
      if (result) return res.status(409).send();

      const newUser = {
        id: req.body.id,
        password: req.body.password,
        salt: bcrypt.genSaltSync(SALT_ROUNDS),
      };
      newUser.password = hash(newUser.password, newUser.salt);

      MongoDB.insertOne("user", newUser).then(() => res.status(200).send());
    })
    .catch(() => res.status(500).send());
});

router.post("/tasks", needLogin, (req, res) => {
  if (
    !req.body.taskName ||
    !req.body.taskDueDate ||
    !req.body.taskDueHour ||
    !req.body.taskDueMinute
  )
    return res.status(400).send();

  try {
    const newTask = {
      owner: req.user._id,
      name: req.body.taskName,
      dueDate: new Date(
        `${req.body.taskDueDate} ${req.body.taskDueHour}:${req.body.taskDueMinute}`
      ),
    };

    MongoDB.insertOne("task", newTask).then(() => res.redirect("/tasks/new"));
  } catch (err) {
    console.error(err);
    res.status(500).redirect("/tasks/new");
  }
});

router.patch("/tasks/:id", needLogin, async (req, res) => {
  if (
    !req.body.taskName ||
    !req.body.taskDueDate ||
    !req.body.taskDueHour ||
    !req.body.taskDueMinute
  )
    return res.status(400).send();

  try {
    const _id = new ObjectId(req.params.id);

    let original = await MongoDB.findOne("task", { _id: _id });
    // Check if the task exists and if it belongs to the current user
    if (!original) return res.status(404).send();
    if (original.owner.toString() != req.user._id.toString())
      return res.status(403).send();

    const toUpdate = {
      owner: req.user._id,
      name: req.body.taskName,
      dueDate: new Date(
        `${req.body.taskDueDate} ${req.body.taskDueHour}:${req.body.taskDueMinute}`
      ),
    };

    MongoDB.updateOne("task", { _id: _id }, toUpdate).then(() =>
      res.redirect("/tasks")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.delete("/tasks/:id", needLogin, async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id);

    let original = await MongoDB.findOne("task", { _id: _id });
    // Check if the task exists and if it belongs to the current user
    if (!original) return res.status(404).send();
    if (original.owner != req.user._id) return res.status(403).send();

    MongoDB.deleteOne("task", { _id: _id }).then((result) => res.send(result));
  } catch (err) {
    return res.status(500).send();
  }
});

module.exports = router;
