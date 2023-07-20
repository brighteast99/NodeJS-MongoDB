const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const encrypt = require("./encrypt");
const MongoDB = require("../db");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    done(null, {});
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "id",
        passwordField: "password",
        session: true,
        passReqToCallback: false,
      },
      function (id, password, done) {
        MongoDB.findAll("user", { id: id })
          .then((result) => {
            if (!result.length) return done(null, false);
            if (result[0].password === encrypt(password, result[0].salt))
              return done(null, result[0]);
            return done(null, false);
          })
          .catch((err) => done(err));
      }
    )
  );
};
