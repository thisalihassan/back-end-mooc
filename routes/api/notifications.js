const express = require("express");
const router = express.Router();
const Notification = require("../../models/Notification");
const { validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

router.post("/", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { course, anouncements, quiz, assignment, user, message } = req.body;
    let notify = await Notification.findOne({ course: course });
    const notification = {};
    if (quiz) {
      notification.quiz = quiz;
    }
    if (assignment) {
      notification.assignment = assignment;
    }
    if (anouncements) {
      notification.anouncements = anouncements;
    }

    if (message) {
      notification.message = message;
    }

    if (notify) {
      notify = await Notification.updateOne(
        { course: course },
        { $push: { notification: notification } },
        { new: true }
      );
      return res.json(notify);
    }
    notify = new Notification({ user: user, course: course });
    notify.notification.push(notification);
    await notify.save();
    return res.json(notify);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getNotification", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { course, user } = req.body;
    let notify = await Notification.find({
      $or: [{ course: { $in: course } }, { user: { $in: user } }]
    });

    return res.json(notify);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
