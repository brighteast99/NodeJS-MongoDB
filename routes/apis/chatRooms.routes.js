const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.get("/:id", async (req, res) => {
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
				$unwind: {
					path: "$chats",
					preserveNullAndEmptyArrays: true,
				},
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
				$unwind: {
					path: "$chats.writer",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group: {
					_id: "$_id",
					participants: { $first: "$participants" },
					chats: {
						$push: {
							$cond: [{ $eq: ["$chats", {}] }, "$$REMOVE", "$chats"],
						},
					},
				},
			},
			{
				$project: {
					_id: 1,
					participants: 1,
					"chats._id": 1,
					"chats.writer._id": 1,
					"chats.writer.name": 1,
					"chats.writer.profileImage": 1,
					"chats.dateCreated": 1,
					"chats.message": 1,
				},
			},
		];

		const [result] = await MongoDB.aggregate("chatRooms", pipeline);

		res.writeHead(200, {
			Connection: "keep-alive",
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});

		if (!result) throw new Error("Chat room not found!");
		if (
			!result.participants.some(
				(participant) => participant.toString() === req.user._id.toString()
			)
		)
			throw new Error("You are not a participant of this chat room!");

		res.write("event: connect\n");
		res.write(`data: ${JSON.stringify(result)}\n\n`);

		const changeStream = MongoDB.watch("chats", [
			{ $match: { "fullDocument.chatAt": id } },
		]);
		changeStream.on("change", async (change) => {
			const [newMessage] = await MongoDB.aggregate("chats", [
				{
					$match: { _id: change.fullDocument._id },
				},
				{
					$lookup: {
						from: "user",
						localField: "writer",
						foreignField: "_id",
						as: "writer",
					},
				},
				{
					$unwind: "$writer",
				},
				{
					$project: {
						_id: 1,
						"writer._id": 1,
						"writer.name": 1,
						"writer.profileImage": 1,
						dateCreated: 1,
						message: 1,
					},
				},
			]);
			req.on("close", () => changeStream.close());

			res.write("event: message\n");
			res.write(`data: ${JSON.stringify(newMessage)}\n\n`);
		});
	} catch (err) {
		console.error(err);

		res.write(`event: error\n`);
		res.write(
			`data: ${JSON.stringify({
				message: err.message,
			})}\n\n`
		);
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
