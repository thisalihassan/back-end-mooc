let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EnrollSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "courses"
    }
  ],

  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ]
});

module.exports = mongoose.model("Subscribe", EnrollSchema);
