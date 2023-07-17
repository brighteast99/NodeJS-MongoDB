const { MongoClient, ServerApiVersion } = require("mongodb");

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
  }

  connect(URL) {
    return new Promise((resolve, reject) => {
      try {
        this.client = new MongoClient(URL, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
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

  disconnect() {
    if (!this.client) return;
    this.client.close();
    this.client = null;
    this.db = null;
  }

  insertOne(collection, data) {
    return new Promise((resolve, reject) => {
      try {
        this.db
          .collection(collection)
          .insertOne(data)
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
          .insertMany(data)
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

  updateOne(collection, condition, data) {
    return new Promise((resolve, reject) => {
      try {
        this.db
          .collection(collection)
          .updateOne(condition, { $set: data })
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
          .deleteOne(condition)
          .then((result) => {
            resolve(result.deletedCount > 0);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new MongoDB();
