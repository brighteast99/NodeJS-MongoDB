const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.post("/", async (req, res) => {
	if (!req.body.chatRoomId || !req.body.message) return res.status(400).send();

	try {
		let chatRoomId = new ObjectId(req.body.chatRoomId);
		const chatRoom = await MongoDB.findOne("chatRooms", { _id: chatRoomId });

		if (!chatRoom) return res.redirect("/404");
		if (
			!chatRoom.participants.some(
				(participant) => participant.toString() === req.user._id.toString()
			)
		)
			return res.status(403).send();

		const newChat = {
			chatAt: chatRoomId,
			writer: req.user._id,
			message: req.body.message,
			dateCreated: new Date(),
		};

		MongoDB.startTransaction();

		await MongoDB.insertOne("chats", newChat).then((result) => {
			newChat._id = result.insertedId;
		});
		await MongoDB.updateOne(
			"chatRooms",
			{ _id: chatRoomId },
			{ $push: { chats: newChat._id } }
		);

		await MongoDB.commitTransaction();
		res.status(201).send();
	} catch (err) {
		console.error(err);
		MongoDB.abortTransaction();
		res.status(500).send();
	}
});

module.exports = router;
