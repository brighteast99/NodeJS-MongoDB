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
}
module.exports = new MongoDB();
