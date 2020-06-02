const mongoose = require("mongoose");
const CoursesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
  },
  tags: {
    type: [String],
  },
  importance: {
    type: String,
  },
  category: {
    type: String,
  },
  preReq: {
    type: String,
  },
  outcome: {
    type: String,
  },
  courseContent: {
    type: String,
  },
  Approval: {
    type: String,
    default: "Pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pic: {
    type: String,
    default:
      "https://res.cloudinary.com/mooc/image/upload/v1590967496/CourseImages/2020-05-31T23:24:56.021Z.png",
  },
});

module.exports = course = mongoose.model("courses", CoursesSchema);
