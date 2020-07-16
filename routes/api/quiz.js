const express = require("express");
const router = express.Router();
const Quiz = require("../../models/Quiz");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Notification = require("../../models/Notification");

router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, autocheck, marks, course, time } = req.body;
    let quiz = await Quiz.find({
      course: course,
      user: req.user.id,
    });

    if (!quiz) {
      quiz = new Quiz({
        time: time,
        course: course,
        autocheck: autocheck,
        title: title,
        user: req.user.id,
        marks: marks,
      });
      await quiz.save();
      return res.json(quiz);
    } else {
      if (quiz.length < 4) {
        quiz = new Quiz({
          time: time,
          course: course,
          autocheck: autocheck,
          title: title,
          marks: marks,
          user: req.user.id,
        });
        await quiz.save();
        return res.json(quiz);
      }
    }
    return res.json(false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/studentsubmit", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let { course, questions, quiz, title, autocheck } = req.body;
    console.log(quiz);
    let refquiz = await Quiz.findOne({
      _id: quiz,
    });
    let mquiz = new Quiz({
      course: course,
      user: req.user.id,
      title: "Solved " + title,
      status: "solved",
      quiz: quiz,
    });
    for (const key of Object.keys(questions)) {
      mquiz.questions.push(questions[key]);
    }
    if (autocheck) {
      if (questions) {
        console.log(refquiz.questions.length);
        const len = questions.length;
        const markPerQues = refquiz.marks / refquiz.questions.length;
        let marks = 0;
        let j = 0;
        questions = questions.sort((a, b) =>
          a.question > b.question ? 1 : -1
        );
        console.log(questions);
        refquiz.questions = refquiz.questions.sort((a, b) =>
          a.question > b.question ? 1 : -1
        );
        console.log("Gets");
        console.log(refquiz.questions);
        for (let i = 0; i < len; i++) {
          if (refquiz.questions[i].myAnswer === questions[i].myAnswer) {
            marks += markPerQues;
          }
        }
        mquiz.autocheck = autocheck;
        mquiz.marks = marks;
      } else {
        mquiz.marks = 0;
      }
    }

    await mquiz.save();
    return res.json(mquiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/findquiz", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { course, roll } = req.body;
    if (roll === "teacher") {
      let quiz = await Quiz.find({
        course: { $in: course },
        user: req.user.id,
      }).populate("course", ["name"]);

      return res.json(quiz);
    } else {
      let quiz = await Quiz.find({
        $or: [
          { course: { $in: course }, status: "Accepted" },
          { user: req.user.id, status: "solved" },
        ],
      }).populate("course", ["name"]);
      if (quiz.length > 0) {
        const arr = [];

        const solvedQioz = quiz.filter((x) => x.status === "solved");
        console.log(solvedQioz);
        if (solvedQioz) {
          for (let i = 0; i < quiz.length; i++) {
            if (!solvedQioz.filter((x) => x.quiz === quiz[i]._id)) {
              arr.push(quiz[i]);
            }
          }
          for (let i = 0; i < solvedQioz.length; i++) {
            arr.push(solvedQioz[i]);
          }
          return arr;
        } else {
          return res.json(quiz);
        }
      }
      return res.json(quiz);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/solvedquiz", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { course, quiz } = req.body;
    let quizzes = await Quiz.find({
      course: course,
      quiz: quiz,
    }).populate("course user", ["name", "avatar"]);
    return res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/isSubmitted", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { quiz } = req.body;
    let quizzes = await Quiz.findOne({
      $or: [
        { user: req.user.id, quiz: quiz },
        { user: req.user.id, _id: quiz, status: "solved" },
      ],
    }).populate("course user", ["name", "avatar"]);

    return res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/uploadquiz", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { questions, id } = req.body;
    let notify = await Notification.find({
      "notification.quiz": id,
    });
    console.log(notify.length);
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id2 = notify[i].notification.filter((x) => x.quiz == id);
        id2 = id2[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id2,
        });

        notify2.notification.pull({ _id: id2 });
        await notify2.save();
      }
    }

    let quiz = await Quiz.findById({ _id: id }).populate("course", ["name"]);
    quiz.status = "Accepted";
    quiz.questions = [];
    await quiz.save();
    for (const key of Object.keys(questions)) {
      quiz.questions.push(questions[key]);
    }

    await quiz.save();
    return res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/updatequiz/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let notify = await Notification.find({
      "notification.quiz": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id2 = notify[i].notification.filter((x) => x.quiz == req.params.id);
        id2 = id[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id2,
        });
        notify2.notification.pull({ _id: id2 });
        await notify2.save();
      }
    }
    const { title, autocheck, marks, course, time } = req.body;
    console.log(marks);
    const quizzFields = {};
    quizzFields.course = course;
    quizzFields.autocheck = autocheck;
    quizzFields.title = title;
    quizzFields.time = time;
    quizzFields.marks = marks;
    quizzFields.users = req.user.id;
    let quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id },
      { $set: quizzFields },
      { new: true }
    );

    return res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/setMarks/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // let notify = await Notification.findOne({
    //   "notification.quiz": req.params.id,
    // }).select({
    //   notification: {
    //     $elemMatch: {
    //       quiz: req.params.id,
    //     },
    //   },
    // });
    // if (notify) {
    //   const id = notify.notification[0]._id;
    //   notify = await Notification.findOne({
    //     "notification._id": id,
    //   });
    //   notify.notification.pull({ _id: id });
    //   await notify.save();
    // }
    const { marks } = req.body;
    let quiz = await Quiz.findById({ _id: req.params.id });
    quiz.marks = marks;
    let quizz = await Quiz.findOneAndUpdate(
      { _id: req.params.id },
      { $set: quiz },
      { new: true }
    );
    return res.json(quizz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/detailquiz/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let quiz = await Quiz.findById({
      _id: req.params.id,
    }).populate("course user quiz", ["name", "roll", "marks"]);

    return res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/deletequiz/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let notify = await Notification.find({
      "notification.quiz": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id2 = notify[i].notification.filter((x) => x.quiz == req.params.id);
        id2 = id2[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id2,
        });
        notify2.notification.pull({ _id: id2 });
        await notify2.save();
      }
    }
    let getQuiz = await Quiz.find({
      $or: [{ _id: req.params.id }, { quiz: req.params.id }],
    });
    console.log(getQuiz.length);
    for (let i = 0; i < getQuiz.length; i++) {
      await Quiz.findOneAndRemove({ _id: getQuiz[i]._id });
    }

    return res.json({ msg: "Quiz deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
