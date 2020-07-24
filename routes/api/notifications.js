const express = require("express");
const router = express.Router();
const Notification = require("../../models/Notification");
const { validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const FollowCourse = require("../../models/CourseFollower");
const User = require("../../models/Users");
const e = require("express");
router.post("/", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      course,
      anouncements,
      quiz,
      assignment,
      message,
      following,
      follower,
      complaint,
      replyComplaint,
      compuser,
    } = req.body;
    let getUsers = await FollowCourse.findOne({ course: course });

    const notification = {};
    if (quiz) {
      notification.quiz = quiz;
    }
    if (complaint) {
      notification.complaint = complaint;
    }
    if (assignment) {
      notification.assignment = assignment;
    }
    if (anouncements) {
      notification.anouncements = anouncements;
    }
    if (replyComplaint) {
      notification.complaint = replyComplaint;
    }
    if (message) {
      notification.message = message;
    }
    if (complaint) {
      let user = await User.findOne({ roll: "admin" });

      let notify = await Notification.findOne({
        user: user._id,
      });
      if (notify) {
        let count = notify.counter + 1;
        notify.counter = count;
        notify.notification.unshift(notification);
        await notify.save();
      } else {
        notify = new Notification({ user: user._id });
        notify.notification.push(notification);
        await notify.save();
      }
      return res.json(notify);
    }
    if (replyComplaint) {
      let notify = await Notification.findOne({
        user: compuser,
      });
      if (notify) {
        let count = notify.counter + 1;
        notify.counter = count;
        notify.notification.unshift(notification);
        await notify.save();
      } else {
        notify = new Notification({ user: compuser });
        notify.notification.push(notification);
        await notify.save();
      }
      return res.json(notify);
    }

    if (following) {
      notification.follower = follower;
      let notify = await Notification.findOne({
        user: following,
      });
      if (notify) {
        let count = notify.counter + 1;
        notify.counter = count;
        notify.notification.unshift(notification);
        await notify.save();
      } else {
        notify = new Notification({ user: following });
        notify.notification.push(notification);
        await notify.save();
      }
      return res.json(notify);
    }

    if (getUsers) {
      let size = getUsers.CourseFollowers.length;

      for (let i = 0; i < size; i++) {
        let user = getUsers.CourseFollowers[i];

        let notify = await Notification.findOne({
          user: user,
        });

        if (notify) {
          let count = notify.counter + 1;
          notify.counter = count;
          notify.notification.unshift(notification);
          await notify.save();
        } else {
          notify = new Notification({ user: user });
          notify.notification.push(notification);
          await notify.save();
        }
      }

      return res.json(getUsers);
    }

    return res.json(getUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/setCounter", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let notify = await Notification.findOne({
      user: req.user.id,
    });

    if (notify) {
      notify.counter = 0;
      await notify.save();
      return res.json("notify");
    }
    return res.json(false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/getNotification", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let notify = await Notification.findOne({
      user: req.user.id,
    });

    if (notify) {
      return res.json(notify);
    }
    return res.json(false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
