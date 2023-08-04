const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.get("/:id", (req, res) => {
	try {
		const id = new ObjectId(req.params.id);

		const pipeline = [
			{ $match: { _id: id } },
			{
				$lookup: {
					from: "chats",
					localField: "chats",
					foreignField: "_id",
					as: "chats",
				},
			},
			{
				$unwind: "$chats",
			},
			{
				$lookup: {
					from: "user",
					localField: "chats.writer",
					foreignField: "_id",
					as: "chats.writer",
				},
			},
			{
				$unwind: "$chats.writer",
			},
			{
				$group: {
					_id: "$_id",
					chats: { $push: "$chats" },
				},
			},
			{
				$project: {
					_id: 1,
					"chats.writer._id": 1,
					"chats.writer.name": 1,
					"chats.writer.profileImage": 1,
					"chats.dateCreated": 1,
					"chats.message": 1,
				},
			},
		];

		MongoDB.aggregate("chatRooms", pipeline).then((result) =>
			res.json(result[0])
		);
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

router.post("/", async (req, res) => {
	if (!req.body.taskId) return res.status(400).send();
	try {
		const taskId = new ObjectId(req.body.taskId);

		const task = await MongoDB.findOne("task", { _id: taskId });
		if (!task) return res.redirect("/404");
		if (task.owner.toString() !== req.user._id.toString())
			return res.status(403).send();
		if (!task.participants.length || task.chatRoom)
			return res.status(409).send();

		const newChatRoom = {
			chatAbout: taskId,
			dateCreated: new Date(),
			participants: [new ObjectId(req.user._id), ...task.participants],
			chats: [],
		};

		MongoDB.startTransaction();

		await MongoDB.insertOne("chatRooms", newChatRoom).then(
			(result) => (newChatRoom._id = result.insertedId)
		);
		await MongoDB.updateOne(
			"task",
			{ _id: taskId },
			{ $set: { chatRoom: newChatRoom._id } }
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
