const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");

router.post("/task", (req, res) => {
  if (!req.body.taskName || !req.body.taskDueDate)
    return res.status(400).send();

  const newTask = {
    taskName: req.body.taskName,
    taskDueDate: req.body.taskDueDate,
  };

  MongoDB.insertOne("task", newTask)
    .then(() => res.json(newTask).send())
    .catch(() =>
      res.status(500).send({ message: `Insertion Failed`, data: newTask })
    );
});

module.exports = router;
