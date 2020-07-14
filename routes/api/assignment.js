const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment");
const Notification = require("../../models/Notification");
const { validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
//
router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { file, duedate, course, title } = req.body;
    const assignFields = {};
    assignFields.course = course;
    assignFields.teacher = req.user.id;
    const assignment = {};
    assignment.file = file;
    assignment.title = title;
    assignment.duedate = duedate;
    assignFields.assignment = assignment;
    let assign = await Assignment.findOne({ course: course });

    if (assign) {
      if (assign.assignment.length < 4) {
        assign = await Assignment.findOneAndUpdate(
          { course: course },
          { $push: { assignment: assignment } },
          { new: true }
        );

        return res.json(assign.assignment[assign.assignment.length - 1]);
      }
      return res.json(false);
    }
    assign = new Assignment(assignFields);
    await assign.save();
    return res.json(assign.assignment[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/remove/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let assign = await Assignment.findOne({ "assignment._id": req.params.id });
    let notify = await Notification.find({
      "notification.assignment": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id = notify[i].notification.filter(
          (x) => x.assignment == req.params.id
        );
        id = id[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id,
        });
        notify2.notification.pull({ _id: id });
        await notify2.save();
      }
    }

    if (assign) {
      if (assign.assignment.length === 1) {
        await Assignment.findOneAndRemove({ "assignment._id": req.params.id });
        return res.json({ msg: "Assignment deleted" });
      }
      assign.assignment.pull({ _id: req.params.id });
      await assign.save();
      return res.json({ msg: "Assignment deleted" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/edit/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { file, title, duedate } = req.body;
    let notify = await Notification.find({
      "notification.assignment": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id = notify[i].notification.filter(
          (x) => x.assignment == req.params.id
        );
        id = id[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id,
        });
        notify2.notification.pull({ _id: id });
        await notify2.save();
      }
    }
    let assign = await Assignment.updateOne(
      { "assignment._id": req.params.id },
      {
        $set: {
          "assignment.$.file": file,
          "assignment.$.title": title,
          "assignment.$.duedate": duedate,
        },
      },
      { new: true }
    );
    assign = await Assignment.findOne({
      "assignment._id": req.params.id,
    }).select({
      assignment: {
        $elemMatch: {
          _id: req.params.id,
        },
      },
    });
    return res.json(assign.assignment[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getassignment/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let assign = await Assignment.findOne({
      "assignment._id": req.params.id,
    })
      .select({
        assignment: {
          $elemMatch: {
            _id: req.params.id,
          },
        },
      })
      .populate("course submitassignment.user", ["name", "avatar"]);
    return res.json(assign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getsubassignment/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let assign = await Assignment.findOne({
      "assignment._id": req.params.id,
    }).populate("course", ["name"]);
    const course = assign.course;
    assign = await Assignment.findOne({
      "assignment._id": req.params.id,
    })
      .select({
        submitassignment: {
          $elemMatch: {
            assignment: req.params.id,
          },
        },
      })
      .populate("submitassignment.user", ["name", "avatar"]);
    return res.json({
      assign: assign,
      course: course,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/getassignments", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { course, roll } = req.body;
    let assign = await Assignment.find({
      course: { $in: course },
    })
      .sort({ "assignment.duedate": 1 })
      .populate("course", ["name"]);
    return res.json(assign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/todayassignments", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { course } = req.body;
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    let assign = await Assignment.find({
      course: { $in: course },
      "assignment.duedate": { $gte: startOfToday },
    })
      .sort({ "assignment.duedate": 1 })
      .populate("course", ["name"]);
    const myassignment = [];
    for (let i = 0; i < assign.length; i++) {
      for (let j = 0; j < assign[i].submitassignment.length; j++) {
        if (assign[i].submitassignment[j].user === req.user.id)
          myassignment.push(assign[i].submitassignment[j].assignment);
      }
    }

    const newassignment = [];

    for (let i = 0; i < assign.length; i++) {
      const assignment = [];
      const myass = {};
      for (let j = 0; j < assign[i].assignment.length; j++) {
        const mthc = myassignment.find(
          (x) => x === assign[i].assignment[j]._id
        );

        if (!mthc) {
          assignment.push(assign[i].assignment[j]);
        }
      }
      myass.course = assign[i].course;
      myass.assignment = assignment;
      newassignment.push(myass);
    }
    assign = newassignment;

    return res.json(assign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/submitassignment/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { file } = req.body;
    const submitassignment = {};
    submitassignment.assignment = req.params.id;
    submitassignment.file = file;
    submitassignment.user = req.user.id;
    let assign = await Assignment.findOne({
      "assignment._id": req.params.id,
    }).populate("course", ["name"]);
    assign.submitassignment.unshift(submitassignment);
    await assign.save();
    return res.json(assign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
