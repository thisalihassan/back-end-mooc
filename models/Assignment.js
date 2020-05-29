let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let AssignmentSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses"
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  assignment: [
    {
      file: {
        type: String
      },
      title: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      },
      duedate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  submitassignment: [
    {
      assignment: { type: Schema.Types.ObjectId },
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      file: {
        type: String
      }
    }
  ]
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
