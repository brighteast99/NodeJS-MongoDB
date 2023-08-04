const express = require("express");
const { needLogin } = require("../../modules/auth");
const router = express.Router();

router.use("/", require("./account.routes"));
router.use("/users", needLogin, require("./users.routes"));
router.use("/tasks", needLogin, require("./tasks.routes"));
router.use("/chat-rooms", needLogin, require("./chatRooms.routes"));
router.use("/chats", needLogin, require("./chats.routes"));

module.exports = router;
