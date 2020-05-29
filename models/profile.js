const mongoose = require("mongoose");
const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  description: {
    type: String
  },
  major: {
    type: String
  },
  skills: {
    type: [String]
  },
  location: {
    type: String
  },
  blockrequest: {
    type: String
  },
  education: [
    {
      fieldofstudy: {
        type: String,
        required: true
      },
      current: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      }
    }
  ],
  work: [
    {
      company: {
        type: String,
        required: true
      },
      position: {
        type: String,
        required: true
      },

      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = profile = mongoose.model("profile", ProfileSchema);
