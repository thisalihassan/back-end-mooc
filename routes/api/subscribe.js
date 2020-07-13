const express = require("express");
const router = express.Router();
const Subscribe = require("../../models/Subscribe");
const Rating = require("../../models/Rating");
const FollowCourse = require("../../models/CourseFollower");
const Notification = require("../../models/Notification");
const Courses = require("../../models/Courses");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
//
router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let courses = await Courses.findOneAndUpdate(
      { _id: req.body.id },
      { $inc: { subscribers: 2 } },
      { new: true }
    );
    let enroll = await FollowCourse.findOne({ course: req.body.id });
    const enrollFields = {};
    enrollFields.course = req.body.id;
    let users = req.user.id;
    if (!enroll) {
      enroll = new FollowCourse(enrollFields);
      enroll.CourseFollowers.unshift(users);
      await enroll.save();
    } else {
      enroll.CourseFollowers.unshift(users);
      await enroll.save();
    }

    let enrolled = await Subscribe.findOne({ user: req.user.id });
    const enrolledFields = {};
    enrolledFields.user = req.user.id;
    courses = req.body.id;
    if (!enrolled) {
      enrolled = new Subscribe(enrolledFields);
      enrolled.courses.unshift(courses);
      await enrolled.save();
      return res.json(enrolled);
    }
    enrolled.courses.unshift(courses);
    await enrolled.save();
    return res.json(enrolled);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getCoursefollowers", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let enroll = await FollowCourse.findOne({
      course: req.body.id,
    }).populate("CourseFollowers", ["name", "avatar"]);
    if (enroll) {
      return res.json(enroll.CourseFollowers);
    }
    return res.json(enroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/follow", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let follow = await Subscribe.findOne({ user: req.user.id });
    const followFields = {};
    followFields.user = req.user.id;
    let following = req.body.id;
    if (!follow) {
      follow = new Subscribe(followFields);
      follow.following.push(following);
      await follow.save();
    } else {
      follow.following.push(following);
      await follow.save();
    }
    let follower = await Subscribe.findOne({ user: req.body.id });
    const followerFields = {};
    followerFields.user = req.body.id;
    let followers = req.user.id;
    if (!follower) {
      follower = new Subscribe(followerFields);
      follower.followers.push(followers);
      await follower.save();
    } else {
      follower.followers.push(followers);
      await follower.save();
    }

    return res.json(follower);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getsubscription", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let enroll = await Subscribe.findOne({
      user: req.user.id,
    }).populate("following courses followers", [
      "name",
      "pic",
      "avatar",
      "user",
    ]);
    if (enroll) {
      return res.json(enroll);
    }
    return res.json("Nothing to show");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getfollowers", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let enroll = await Subscribe.findOne({
      user: req.body.id,
    });
    if (enroll) {
      return res.json(enroll.followers.length);
    }
    return res.json("Nothing to show");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/unsubscribecourse", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const courses = await Courses.findOneAndUpdate(
      { _id: req.body.id },
      { $inc: { subscribers: -1 } },
      { new: true }
    );
    let follow = await Subscribe.findOne({ user: req.user.id });
    if (follow) {
      follow.courses.pull({ _id: req.body.id });
      await follow.save();
      let enroll = await FollowCourse.findOne({
        course: req.body.id,
      });
      enroll.CourseFollowers.pull({ _id: req.user.id });
      enroll.save();
      return res.json(follow);
    }
    return res.json(false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/unfollow", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let notify = await Notification.findOne({
      user: req.body.id,
    });
    if (notify) {
      notify.notification.pull({ follwer: req.user.id });
    }
    let follow = await Subscribe.findOne({ user: req.user.id });
    if (follow) {
      follow.following.pull({ _id: req.body.id });
      await follow.save();
    }
    let follower = await Subscribe.findOne({ user: req.body.id });
    if (follower) {
      follower.followers.pull({ _id: req.user.id });
      await follower.save();
      return res.json(follow);
    }
    return res.json(false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/rate", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { CourseRate, TeacherRate, course, teacher } = req.body;
    const rating = { CourseRate, TeacherRate, course, teacher };

    let myrating = await Rating.findOne({ course: course });
    if (!myrating) {
      myrating = await Rating(rating);
      await myrating.save();
      return res.json(myrating);
    } else {
      myrating.CourseRate.push(CourseRate);
      myrating.TeacherRate.push(TeacherRate);
      await myrating.save();
      return res.json(myrating);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getrate", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let myrating = await Rating.findOne({
      $or: [{ course: req.body.id }, { teacher: req.body.id }],
    }).populate("TeacherRate.student CourseRate.student", ["name", "avatar"]);

    return res.json(myrating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
