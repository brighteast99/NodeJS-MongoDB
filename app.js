require("dotenv").config({ path: ".env.local" });
const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./modules/auth/passport");
const app = express();
let server;

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passportConfig();
app.use("/public", express.static("public"));
app.use("/", require("./routes"));
app.set("view engine", "ejs");

const mongoDB = require("./modules/db");
mongoDB
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");

    server = app.listen(process.env.PORT, () => {
      console.log(`listening on ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Failed to connect to database!");
  });

function closeServer(signal) {
  server.close(() =>
    console.log(`Received ${signal} at ${new Date()}.\nClosing server.`)
  );
  mongoDB.close().then(() => console.log("Closed MongoDB connection."));
}
process.on("SIGTERM", closeServer);
process.on("SIGINT", closeServer);
