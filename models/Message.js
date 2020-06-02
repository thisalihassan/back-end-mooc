const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  Message: [
    {
      user: {
        type: String,
        required: true,
      },
      text: {
        type: String,
      },
      timeStamp: { type: String },
    },
  ],
});

module.exports = Message = mongoose.model("Messages", MessageSchema);
