const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { hash } = require(".");
const MongoDB = require("../db");

module.exports = () => {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		const pipeline = [
			{ $match: { id: id } },
			{
				$project: {
					id: 0,
					password: 0,
					salt: 0,
				},
			},
		];
		MongoDB.aggregate("user", pipeline)
			.then(([result]) => {
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
					.then(([result]) => {
						if (!result) return done(null, false);
						if (result.password === hash(password, result.salt))
							return done(null, result);

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
