const express = require("express");
const router = express.Router();
const Complaint = require("../../models/complaint");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

router.post("/answercomplaints", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { question, answer } = req.body;
  const complaintField = {};

  complaintField.status = "Active";
  if (question) complaintField.question = question;
  if (answer) complaintField.answer = answer;

  try {
    let complaint = await Complaint.findOne({
      _id: req.body.id,
    });
    complaintField.user = complaint.user;
    if (complaint) {
      complaint = await Complaint.findOneAndUpdate(
        { _id: req.body.id },
        { $set: complaintField },
        { new: true }
      );
      return res.json(complaint);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/sendcomplaints", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { question, answer } = req.body;
  const complaintField = {};
  complaintField.user = req.user.id;
  if (question) complaintField.question = question;
  if (answer) complaintField.answer = answer;

  try {
    complaint = new Complaint(complaintField);
    await complaint.save();
    return res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getComplaints", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let complaint = await Complaint.find().sort({ date: -1 });

    return res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getActive", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let complaint = await Complaint.find({ status: "Active" }).sort({
      date: -1,
    });

    return res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
