let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let QuizSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "courses",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: "quiz",
  },
  status: {
    type: String,
    default: "Pending",
  },
  marks: {
    type: Number,
  },
  title: {
    type: String,
  },
  time: {
    type: Number,
  },

  autocheck: {
    type: Boolean,
  },
  questions: [
    {
      id: {
        type: String,
      },
      question: {
        type: String,
      },
      answerType: {
        type: Number,
      },
      myAnswer: {
        type: String,
      },
      answers: [
        {
          id: {
            type: String,
          },
          label: {
            type: String,
          },
        },
      ],
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("quiz", QuizSchema);
