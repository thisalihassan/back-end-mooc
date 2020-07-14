const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models/Users");
const Report = require("../../models/report");
const Courses = require("../../models/Courses");
const Anouncement = require("../../models/Anouncements");
const Quiz = require("../../models/Quiz");
const Assignment = require("../../models/Assignment");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
// @route   Get api/profile/me
// @desc    Get current users profile
// @access  private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar", "roll"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this User" });
    }
    return res.json(profile);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});
router.get("/userProfile/:uid", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.uid,
    }).populate("user", ["name", "avatar", "roll"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this User" });
    }
    return res.json(profile);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});
router.post("/getreports", auth, async (req, res) => {
  try {
    let report = await Report.find().populate("reported", ["name", "avatar"]);
    return res.json(report);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});
// @route   Post api/profile/me
// @desc    Create or update a user profile
// @access  private
router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { major, description, skills, location } = req.body;
  const profileFields = {};
  profileFields.user = req.user.id;
  if (major) profileFields.major = major;
  if (description) profileFields.description = description;
  if (skills) {
    profileFields.skills = skills;
  }
  if (location) profileFields.location = location;

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    }
    profile = new Profile(profileFields);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/reprotProfile", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let report = await Report.findOne({ reported: req.body.id });
    if (report) {
      const reporter = req.user.id;
      report.reporter.push(reporter);
      await report.save();
      return res.json(report);
    }
    report = new Report({ reported: req.body.id });
    const reporter = req.user.id;
    report.reporter.push(reporter);
    await report.save();
    return res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/approveProfile", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let fi = await Report.findOne({ reported: req.body.id });
    let ress = await Report.findOneAndRemove({ reported: req.body.id });
    console.log(ress);
    console.log(fi);
    return res.json(null);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   GET api/profile/
// @desc    Get All Profile
// @access  Public

router.post("/findmyreport", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let report = await Report.findOne({
      reported: req.body.id,
      reporter: req.user.id,
    });
    return res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   GET api/profile/
// @desc    Get All Profile
// @access  Public
router.get("/", [auth], async (req, res) => {
  try {
    const profiles = await Profile.find({
      user: { $ne: req.user.id },
    }).populate("user", ["name", "avatar", "roll"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/
// @desc    Add Profile Experience
// @access  Private
router.put(
  "/education",
  [
    auth,
    [
      check("fieldofstudy", "Field is required").not().isEmpty(),
      check("current", "Current Degree is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fieldofstudy, location, from, to, current } = req.body;

    const newEdu = {
      fieldofstudy,
      location,
      from,
      to,
      current,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/geteducation/:edu_id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let education = await Profile.findOne({ user: req.user.id }).select({
      education: { $elemMatch: { _id: req.params.edu_id } },
    });

    return res.json(education);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getwork/:w_id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let work = await Profile.findOne({ user: req.user.id }).select({
      work: { $elemMatch: { _id: req.params.w_id } },
    });

    return res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put(
  "/work",
  [
    auth,
    [
      check("company", "Field is required").not().isEmpty(),
      check("position", "Current Degree is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { company, from, to, position } = req.body;

    const newWork = {
      company,

      from,
      to,
      position,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.work.unshift(newWork);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/education/:edu_id", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fieldofstudy, from, to, current } = req.body;
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.updateOne(
        { "education._id": req.params.edu_id },
        {
          $set: {
            "education.$.fieldofstudy": fieldofstudy,
            "education.$.from": from,
            "education.$.to": to,
            "education.$.current": current,
          },
        },
        { new: true }
      );
    }
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.education.pull({ _id: req.params.edu_id });
      await profile.save();
      return res.json(profile);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/work/:w_id", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { company, from, to, position } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.updateOne(
        { "work._id": req.params.w_id },
        {
          $set: {
            "work.$.company": company,
            "work.$.from": from,
            "work.$.to": to,
            "work.$.position": position,
          },
        },
        { new: true }
      );
    }
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/work/:wid", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.work.pull({ _id: req.params.wid });
      await profile.save();
      return res.json(profile);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});
router.post("/delete", auth, async (req, res) => {
  try {
    const password = req.body.password;
    let user = await User.findOne({ _id: req.user.id });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentails" }] });
      }
      let res = await Courses.find({ user: req.user.id });
      for (let i = 0; i < res.data.length; i++) {
        const config = { headers: { "Content-Type": "application/json" } };
        axios.delete(
          "https://moocback.herokuapp.com/api/Courses/delete/" + id,
          {},
          config
        );
      }
      await Profile.findOneAndRemove({ user: req.user.id });
      await User.findOneAndRemove({ _id: req.user.id });
      return res.json({ msg: "User deleted" });
    }
    return res.json({ msg: "Wrong Password Entered" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
