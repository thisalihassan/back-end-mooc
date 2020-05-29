let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let FilesSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses"
  },
  lecturefiles: [
    {
      files: [
        {
          type: String
        }
      ],
      lecture: {
        type: String
      }
    }
  ]
});

module.exports = mongoose.model("lectureFiles", FilesSchema);
