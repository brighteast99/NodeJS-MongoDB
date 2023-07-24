const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;
const { formatDate, formatInputDate } = require("../modules/utils/");

router.get("/", (req, res) => {
  const keyword = req.query.search;

  let condition = [
    {
      $match: {
        owner: req.user._id,
      },
    },
    {
      $sort: { dueDate: -1 },
    },
  ];

  if (keyword)
    condition.unshift({
      $search: {
        index: "nameSearch",
        text: { query: keyword, path: "name" },
      },
    });

  MongoDB.findAll("task", condition)
    .then((tasks) => {
      res.render("list.ejs", {
        tasks: tasks,
        query: keyword,
        formatDate: formatDate,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

router.get("/new", (req, res) => {
  res.render("task_form.ejs", {
    createMode: true,
    formatInputDate: formatInputDate,
  });
});

router.get("/:id/edit", (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).send();
  }

  MongoDB.findOne("task", { _id: _id })
    .then((task) => {
      // Check if the task exists and if it belongs to the current user
      if (!task) res.status(404).send();
      else if (task.owner != req.user._id.toString()) res.status(403).send();
      else
        res.render("task_form.ejs", {
          createMode: false,
          task: task,
          formatInputDate: formatInputDate,
        });
    })
    .catch(() => res.status(500).send());
});

module.exports = router;
