const bcrypt = require("bcrypt-nodejs");
const saltRounds = 10;

module.exports = (plaintext, salt) => {
  return bcrypt.hashSync(plaintext, salt);
};
