const express = require("express");
const app = express();
var path = require("path");

app.listen(8080, function () {
  console.log("listening on 8080");
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/pages/index.html"));
});

app.get("/new", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/pages/new.html"));
});
