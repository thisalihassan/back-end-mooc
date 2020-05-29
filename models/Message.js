const mongoose = require("mongoose");
const getCurrentTime = () => {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes();
};
const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  Message: [
    {
      user: {
        type: String,
        required: true
      },
      text: {
        type: String
      },
      timeStamp: { type: String, default: getCurrentTime }
    }
  ]
});

module.exports = Message = mongoose.model("Messages", MessageSchema);
