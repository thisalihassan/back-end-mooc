const mongoose = require("mongoose");
const CoursesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  name: {
    type: String
  },
  tags: {
    type: [String]
  },
  importance: {
    type: String
  },
  category: {
    type: String
  },
  preReq: {
    type: String
  },
  outcome: {
    type: String
  },
  courseContent: {
    type: String
  },
  Approval: {
    type: String,
    default: "Pending"
  },
  date: {
    type: Date,
    default: Date.now
  },
  pic: {
    type: String,
    default: "default.jpg"
  }
});

module.exports = course = mongoose.model("courses", CoursesSchema);
