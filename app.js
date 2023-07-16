require("dotenv").config({ path: ".env.local" });
const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes"));

const mongoDB = require("./modules/db");

mongoDB
  .connect(process.env.DB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  })
  .catch((err) => {
    console.log("Failed to connect to database!");
  });
