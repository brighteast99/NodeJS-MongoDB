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

  findAll(collection) {
    return new Promise((resolve, reject) => {
      try {
        this.db
          .collection(collection)
          .find()
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
