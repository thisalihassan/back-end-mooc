let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EnrollSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses"
  },
  CourseFollowers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ]
});

module.exports = mongoose.model("CourseFollower", EnrollSchema);
