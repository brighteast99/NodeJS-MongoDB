const express = require("express");
const router = express.Router();
const MongoDB = require("../modules/db");
const ObjectId = require("mongodb").ObjectId;
const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const { SALT_ROUNDS, hash, needLogin } = require("../modules/auth");
const upload = require("../modules/multer");
const fs = require("fs");

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
        name: req.body.id,
        password: req.body.password,
        salt: bcrypt.genSaltSync(SALT_ROUNDS),
      };
      newUser.password = hash(newUser.password, newUser.salt);

      MongoDB.insertOne("user", newUser).then(() => res.status(200).send());
    })
    .catch(() => res.status(500).send());
});

router.patch(
  "/user/:id",
  needLogin,
  upload.single("profileImage"),
  async (req, res) => {
    if (!req.body.name) return res.status(400).send();

    try {
      const _id = new ObjectId(req.params.id);

      let original = await MongoDB.findOne("user", { _id: _id });
      if (!original) return res.status(400).send();
      if (original._id.toString() != req.user._id.toString())
        return res.status(403).send();

      const toUpdate = {
        name: req.body.name,
      };
      if (req.file)
        toUpdate.profileImage = `${req.protocol}://${req.get("host")}/${
          process.env.MULTER_DIR
        }/${req.file.filename}`;

      MongoDB.updateOne("user", { _id: _id }, toUpdate).then(() => {
        if (original.profileImage && req.file)
          fs.unlink(
            `${process.env.MULTER_DIR}/${original.profileImage.substring(
              original.profileImage.lastIndexOf("/")
            )}`,
            () => {}
          );
        return res.redirect("/my");
      });
    } catch (err) {
      console.error(err);
      if (req.file)
        fs.unlink(`${process.env.MULTER_DIR}/${req.file.filename}`, () => {});

      return res.status(500).send();
    }
  }
);

router.get("/users", needLogin, (req, res) => {
  const name = req.query.name;

  if (!name) return res.json([]);

  let pipeline = [
    { $match: { name: new RegExp(`^${name}`, "i") } },
    { $limit: 5 },
    { $project: { _id: 1, name: 1 } },
  ];

  MongoDB.aggregate("user", pipeline)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send();
    });
});

router.post("/tasks", needLogin, (req, res) => {
  if (!req.body.name || !req.body.dueDate) return res.status(400).send();

  try {
    const newTask = {
      owner: req.user._id,
      name: req.body.name,
      dueDate: new Date(req.body.dueDate),
      participants: [],
    };
    if (req.body.participants)
      req.body.participants.forEach((participant) => {
        newTask.participants.push(new ObjectId(participant));
      });

    MongoDB.insertOne("task", newTask).then(() => res.status(201).send());
  } catch (err) {
    console.error(err);
    res.status(500).redirect("/tasks/new");
  }
});

router.patch("/tasks/:id", needLogin, async (req, res) => {
  if (!req.body.name || !req.body.dueDate) return res.status(400).send();

  try {
    const _id = new ObjectId(req.params.id);

    let original = await MongoDB.findOne("task", { _id: _id });
    // Check if the task exists and if it belongs to the current user
    if (!original) return res.status(404).send();
    if (original.owner.toString() != req.user._id.toString())
      return res.status(403).send();

    const updateData = {
      name: req.body.name,
      dueDate: new Date(req.body.dueDate),
      participants: [],
    };

    if (req.body.participants)
      updateData.participants.push(
        ...req.body.participants.map((participant) => new ObjectId(participant))
      );

    MongoDB.updateOne("task", { _id: _id }, updateData).then(() =>
      res.status(200).send()
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
    if (original.owner.toString() != req.user._id.toString())
      return res.status(403).send();

    MongoDB.deleteOne("task", { _id: _id }).then((result) => res.send(result));
  } catch (err) {
    return res.status(500).send();
  }
});

module.exports = router;
