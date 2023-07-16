const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

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

app.post("/add", (req, res) => {
  console.log(req.body);
  if (!req.body.taskName || !req.body.taskDueDate)
    return res.status(400).send("정보 부족");

  res.send("전송완료");
});
