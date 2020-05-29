let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ReviewSchema = new Schema({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "course"
  },
  student: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ],
  CourseRate: [
    {
      rating: {
        type: Number
      },
      review: {
        type: String
      },
      student: {
        type: Schema.Types.ObjectId,
        ref: "user"
      }
    }
  ],
  TeacherRate: [
    {
      rating: {
        type: Number
      },
      review: {
        type: String
      },
      student: {
        type: Schema.Types.ObjectId,
        ref: "user"
      }
    }
  ]
});

module.exports = mongoose.model("Reviews", ReviewSchema);
