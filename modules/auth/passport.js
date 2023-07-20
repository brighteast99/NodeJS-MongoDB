const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { hash } = require(".");
const MongoDB = require("../db");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    MongoDB.findOne("user", { id: id })
      .then((result) => {
        done(null, result);
      })
      .catch((err) => {
        console.error(err);
        const error = new Error();
        error.status = 500;
        done(error);
      });
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
            if (result[0].password === hash(password, result[0].salt))
              return done(null, result[0]);

            const error = new Error();
            error.status = 401;
            done(error);
          })
          .catch((err) => {
            console.error(err);
            const error = new Error();
            error.status = 500;
            done(error);
          });
      }
    )
  );
};
