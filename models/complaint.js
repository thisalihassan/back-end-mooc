let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let complaint = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("complaint", complaint);
