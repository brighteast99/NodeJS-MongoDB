const { MongoClient, ServerApiVersion } = require("mongodb");

class MongoDB {
	constructor() {
		this.client = null;
		this.db = null;
		this.session = null;
		this.options = {};
	}

	connect(URL) {
		return new Promise((resolve, reject) => {
			try {
				this.client = new MongoClient(URL, {
					serverApi: {
						version: ServerApiVersion.v1,
						deprecationErrors: true,
					},
				});
				this.client.connect().then(() => {
					this.db = this.client.db("todoApp");
					resolve();
				});
			} catch (err) {
				this.client = null;
				this.db = null;
				reject(err);
			}
		});
	}

	close() {
		return new Promise((resolve, reject) => {
			if (!this.client) return resolve();
			this.client
				.close()
				.then(() => {
					this.client = null;
					this.db = null;
					resolve();
				})
				.catch((err) => reject(err));
		});
	}

	startTransaction() {
		if (!this.client) throw new Error("MongoDB client is not initialized");
		if (this.session) throw new Error("Transaction already started");

		this.session = this.client.startSession();
		this.session.startTransaction();
		this.options = { session: this.session };
	}

	async commitTransaction() {
		if (!this.session) return;
		await this.session.commitTransaction();
		this.session.endSession();
		this.session = null;
		this.options = {};
	}

	abortTransaction() {
		if (!this.session) return;
		this.session.abortTransaction();
		this.session.endSession();
		this.session = null;
		this.options = {};
	}

	insertOne(collection, data) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.insertOne(data, this.options)
					.then((result) => {
						resolve(result);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	insertMany(collection, data) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.insertMany(data, this.options)
					.then((result) => {
						resolve(result);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	findAll(collection, condition) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.find(condition)
					.toArray()
					.then((result) => {
						resolve(result);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	findOne(collection, condition) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.findOne(condition)
					.then((result) => {
						resolve(result);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	updateOne(collection, condition, data) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.updateOne(condition, { $set: data }, this.options)
					.then((result) => {
						resolve(result.modifiedCount > 0);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	deleteOne(collection, condition) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.deleteOne(condition, this.options)
					.then((result) => {
						resolve(result.deletedCount > 0);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	deleteMany(collection, condition) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.deleteMany(condition, this.options)
					.then((result) => {
						resolve(result.deletedCount > 0);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	aggregate(collection, pipeline) {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.collection(collection)
					.aggregate(pipeline)
					.toArray()
					.then((result) => {
						resolve(result);
					});
			} catch (err) {
				reject(err);
			}
		});
	}
}
module.exports = new MongoDB();
