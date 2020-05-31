const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "mooc",
  api_key: "265854168759756",
  api_secret: "eSdb4VE70MLDyUXw3Pv9f7abuPY",
});
module.exports = cloudinary;
