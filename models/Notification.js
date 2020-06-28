let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  counter: { type: Number, default: 1 },
  notification: [
    {
      mycourse: {
        type: Schema.Types.ObjectId,
        ref: "courses",
      },
      anouncements: {
        type: Schema.Types.ObjectId,
        ref: "Anouncements",
      },
      quiz: {
        type: Schema.Types.ObjectId,
        ref: "quiz",
      },
      assignment: {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
      message: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("NotificationCenter", NotificationSchema);
