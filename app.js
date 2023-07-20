require("dotenv").config({ path: ".env.local" });
const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./modules/auth/passport");
const app = express();

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
  .then(async () => {
    console.log("Connected to MongoDB");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  })
  .catch((err) => {
    console.log("Failed to connect to database!");
  });
