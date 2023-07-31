const express = require("express");
const router = express.Router();
const MongoDB = require("../../modules/db");
const ObjectId = require("mongodb").ObjectId;
const upload = require("../../modules/multer");
const fs = require("fs");

router.get("/", (req, res) => {
	const name = req.query.name;

	if (!name) return res.json([]);

	let pipeline = [
		{ $match: { name: new RegExp(`^${name}`, "i") } },
		{ $limit: 5 },
		{ $project: { _id: 1, name: 1 } },
	];

	if (req.query.excludeSelf === "true")
		pipeline.push({ $match: { _id: { $ne: req.user._id } } });

	MongoDB.aggregate("user", pipeline)
		.then((result) => {
			return res.json(result);
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).send();
		});
});

router.patch("/:id", upload.single("profileImage"), async (req, res) => {
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
});

module.exports = router;
