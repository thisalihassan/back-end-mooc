const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const MessageProfile = require("../../models/Message");

router.post("/SendMessage", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { room, Message } = req.body;
  //Built Profile object
  const MessageFields = {};
  MessageFields.room = room;
  if (Message) MessageFields.Message = Message;
  //   if (skills) {
  //     profileFields.skills = skills.split(",").map(skill => skill.trim());
  //   }
  //   if (location) profileFields.location = location;

  try {
    let messageProfile = await MessageProfile.findOne({ room: room });
    if (messageProfile) {
      messageProfile = await MessageProfile.findOneAndUpdate(
        { room: room },
        { $push: { Message: Message } }
        // { new: true }
      );
      return res.json(messageProfile);
    }
    messageProfile = new MessageProfile(MessageFields);

    await messageProfile.save();
    res.json(messageProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/FindMessages", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { room } = req.body;
  try {
    let messageProfile = await MessageProfile.findOne({ room: room });
    return res.json(messageProfile.Message);
  } catch (err) {}
});

router.post("/delete", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { room } = req.body;
  try {
    let messageProfile = await MessageProfile.remove({ room: room });
    return res.json(messageProfile);
  } catch (err) {}
});
module.exports = router;
