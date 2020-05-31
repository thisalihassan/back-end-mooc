var multer = require("multer");
var profilepic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profile");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var coursepic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Courseimages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var lecturefiles = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "lectures");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

exports.uploadFiles = multer({ storage: lecturefiles }).any();
exports.uploadprofile = multer({ storage: profilepic }).single("file");
exports.uploadcourse = multer({ storage: coursepic }).single("file");
exports.multer = multer;
