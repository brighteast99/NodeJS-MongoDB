const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;
const { formatDate, formatInputDate } = require("../../modules/utils/");

router.get("/", (req, res) => {
	const keyword = req.query.search;

	let pipeline = [
		{
			$match: {
				$or: [{ owner: req.user._id }, { participants: req.user._id }],
			},
		},
		{
			$lookup: {
				from: "user",
				localField: "owner",
				foreignField: "_id",
				as: "owner",
			},
		},
		{
			$unwind: "$owner",
		},
		{
			$lookup: {
				from: "user",
				localField: "participants",
				foreignField: "_id",
				as: "participants",
			},
		},
		{
			$sort: { dueDate: -1 },
		},
	];

	if (keyword)
		pipeline.unshift({
			$search: {
				index: "nameSearch",
				text: { query: keyword, path: "name" },
			},
		});

	MongoDB.aggregate("task", pipeline)
		.then((tasks) => {
			res.render("list.ejs", {
				user: { _id: req.user._id },
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

router.get("/:id", async (req, res) => {
	try {
		let _id = new ObjectId(req.params.id);

		const pipeline = [
			{
				$match: {
					_id: _id,
				},
			},
			{
				$lookup: {
					from: "user",
					localField: "owner",
					foreignField: "_id",
					as: "owner",
				},
			},
			{
				$unwind: "$owner",
			},
			{
				$lookup: {
					from: "user",
					localField: "participants",
					foreignField: "_id",
					as: "participants",
				},
			},
		];

		const [task] = await MongoDB.aggregate("task", pipeline);
		// Check if the task exists and if it belongs to the current user
		if (!task) res.redirect("/404");
		else if (
			task.owner._id != req.user._id.toString() &&
			!task.participants.some(
				(participant) => participant._id.toString() === req.user._id.toString()
			)
		)
			res.status(403).send();
		else
			res.render("task.ejs", {
				user: { _id: req.user._id },
				task: task,
				formatDate: formatDate,
			});
	} catch (err) {
		console.error(err);
		return res.status(500).send();
	}
});

router.get("/:id/edit", async (req, res) => {
	try {
		let _id = new ObjectId(req.params.id);

		const pipeline = [
			{ $match: { _id: _id } },
			{
				$lookup: {
					from: "user",
					localField: "participants",
					foreignField: "_id",
					as: "participants",
				},
			},
			{
				$project: {
					owner: 1,
					name: 1,
					dueDate: 1,
					"participants._id": 1,
					"participants.name": 1,
				},
			},
		];

		const [task] = await MongoDB.aggregate("task", pipeline);
		// Check if the task exists and if it belongs to the current user
		if (!task) res.redirect("/404");
		else if (task.owner != req.user._id.toString()) res.status(403).send();
		else
			res.render("task_form.ejs", {
				createMode: false,
				task: task,
				formatInputDate: formatInputDate,
			});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

module.exports = router;
