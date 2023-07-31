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
				owner: req.user._id,
			},
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

router.get("/:id", (req, res) => {
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
					localField: "participants",
					foreignField: "_id",
					as: "participants",
				},
			},
		];

		MongoDB.aggregate("task", pipeline).then((tasks) => {
			// Check if the task exists and if it belongs to the current user
			if (!tasks.length) res.status(404).send();
			else if (tasks[0].owner != req.user._id.toString())
				res.status(403).send();
			else
				res.render("task.ejs", {
					task: tasks[0],
					formatDate: formatDate,
				});
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send();
	}
});

router.get("/:id/edit", (req, res) => {
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

		MongoDB.aggregate("task", pipeline).then((tasks) => {
			// Check if the task exists and if it belongs to the current user
			if (!tasks.length) res.status(404).send();
			else if (tasks[0].owner != req.user._id.toString())
				res.status(403).send();
			else
				res.render("task_form.ejs", {
					createMode: false,
					task: tasks[0],
					formatInputDate: formatInputDate,
				});
		});
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

module.exports = router;
