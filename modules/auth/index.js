const bcrypt = require("bcrypt-nodejs");
const saltRounds = 10;

module.exports.hash = (plaintext, salt) => {
  return bcrypt.hashSync(plaintext, salt);
};

module.exports.needLogin = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).redirect("/login");
  next();
};
