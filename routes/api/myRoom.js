const express = require("express");
const router = express.Router();
const Room = require("../../models/Room");
const KICK = require("../../models/KickedUsers");
const { validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id, guidelines } = req.body;
    let room = await Room.findOne({
      course: id,
    });
    if (!room) {
      room = new Room({
        user: req.user.id,
        course: id,
        guidelines: guidelines,
      });
      await room.save();
      return res.json(room);
    }
    return res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getmyrooms", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { roll, course } = req.body;
    if (roll === "student") {
      let room = await Room.find({
        course: { $in: course },
      }).populate("course", ["name"]);

      return res.json(room);
    } else {
      let room = await Room.find({
        user: req.user.id,
      }).populate("course", ["name"]);

      return res.json(room);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/find/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let room = await Room.findOne({
      _id: req.params.id,
    }).populate("course user", ["name", "roll"]);

    return res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/kick", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const kick = new KICK({
      user: req.body.id,
      room: req.body.myroom,
    });
    await kick.save();
    return res.json(kick);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/findkick", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const kick = await KICK.findOne({
      user: req.body.id,
      room: req.body.myroom,
    });
    return res.json(kick);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/update/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let room = await Room.findOne({
      _id: req.body.id,
    }).populate("course user", ["name", "roll"]);
    room.guidelines = req.body.guidelines;
    await room.save();
    return res.json(room);
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
    await Room.findOneAndRemove({ _id: req.params.id });
    return res.json({ msg: "Quiz deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
