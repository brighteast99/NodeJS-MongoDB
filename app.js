const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes/index"));

app.listen(8080, function () {
  console.log("listening on 8080");
});
