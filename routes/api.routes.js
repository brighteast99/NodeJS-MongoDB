const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.post("/tasks", (req, res) => {
  if (!req.body.taskName || !req.body.taskDueDate)
    return res.status(400).send();

  const newTask = {
    name: req.body.taskName,
    dueDate: req.body.taskDueDate,
  };

  MongoDB.insertOne("task", newTask)
    .then(() => res.json(newTask).send())
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
