require("dotenv").config({ path: ".env.local" });
const express = require("express");
const methodOverride = require("method-override");
const passport = require("passport");
const passportConfig = require("./modules/auth/passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
let server;

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
passportConfig();
app.use((req, res, next) => {
  if (!req.isAuthenticated()) res.clearCookie("connect.sid");
  next();
});
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
  if (server) {
    server.close(() =>
      console.log(`Received ${signal} at ${new Date()}.\nClosing server.`)
    );
    mongoDB.close().then(() => console.log("Closed MongoDB connection."));
  }
}
process.on("SIGTERM", closeServer);
process.on("SIGINT", closeServer);
