let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let AnounceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses"
  },
  anouncement: [
    {
      description: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("Anouncements", AnounceSchema);
