let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let KickSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "room"
  },
  createdAt: { type: Date, default: Date.now, expires: 60 }
});

module.exports = mongoose.model("KickedUsers", KickSchema);
