const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;

router.post("/", (req, res) => {
	if (!req.body.name || !req.body.dueDate) return res.status(400).send();

	try {
		const newTask = {
			owner: req.user._id,
			name: req.body.name,
			dueDate: new Date(req.body.dueDate),
			participants: [],
			chatRoom: null,
		};
		if (req.body.participants)
			req.body.participants.forEach((participant) => {
				newTask.participants.push(new ObjectId(participant));
			});

		MongoDB.insertOne("task", newTask).then((result) =>
			res.status(201).json({ _id: result.insertedId })
		);
	} catch (err) {
		console.error(err);
		res.status(500).redirect("/tasks/new");
	}
});

router.patch("/:id", async (req, res) => {
	if (!req.body.name || !req.body.dueDate) return res.status(400).send();

	try {
		const _id = new ObjectId(req.params.id);

		let original = await MongoDB.findOne("task", { _id: _id });
		// Check if the task exists and if it belongs to the current user
		if (!original) return res.redirect("/404");
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

		MongoDB.startTransaction();

		await MongoDB.updateOne("task", { $set: { _id: _id } }, updateData);
		if (original.chatRoom) {
			if (updateData.participants.length)
				await MongoDB.updateOne(
					"chatRooms",
					{ _id: original.chatRoom },
					{
						$set: {
							participants: [
								new ObjectId(req.user._id),
								...updateData.participants,
							],
						},
					}
				);
			else {
				await MongoDB.deleteOne("chatRooms", {
					_id: original.chatRoom,
				});
				await MongoDB.deleteMany("chats", {
					chatAt: original.chatRoom,
				});
			}
		}

		await MongoDB.commitTransaction();
		res.status(200).send();
	} catch (err) {
		console.error(err);
		MongoDB.abortTransaction();
		res.status(500).send();
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const _id = new ObjectId(req.params.id);

		let original = await MongoDB.findOne("task", { _id: _id });
		// Check if the task exists and if it belongs to the current user
		if (!original) return res.redirect("/404");
		if (original.owner.toString() != req.user._id.toString())
			return res.status(403).send();

		MongoDB.startTransaction();
		let result = await MongoDB.deleteOne("task", { _id: _id });
		if (original.chatRoom) {
			await MongoDB.deleteOne("chatRooms", {
				_id: original.chatRoom,
			});
			await MongoDB.deleteMany("chats", {
				chatAt: original.chatRoom,
			});
		}
		await MongoDB.commitTransaction();
		res.send(result);
	} catch (err) {
		console.error(err);
		MongoDB.abortTransaction();
		return res.status(500).send();
	}
});

module.exports = router;
