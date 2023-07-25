const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

try {
  // Check designated directory exists
  fs.readdirSync(process.env.MULTER_DIR);
} catch (err) {
  // Create directory if it doesn't exist
  fs.mkdirSync(process.env.MULTER_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.MULTER_DIR}/`);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb({ message: "no such file" }, false);
    }
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb({ message: "Only image files can be uploaded." }, false);
  },
});

const fileFilter = (module.exports = multer({
  storage: storage,
}));
