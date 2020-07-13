let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RoomSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses",
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  guidelines: {
    type: String,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  kicked: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("room", RoomSchema);
