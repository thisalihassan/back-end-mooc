const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Courses = require("../../models/Courses");
const ContentBasedRecommender = require("content-based-recommender");
const Subscribe = require("../../models/Subscribe");
const auth = require("../../middleware/auth");
const recommender = new ContentBasedRecommender({
  minScore: 0.3,
  maxSimilarDocuments: 20,
});

router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let enroll = await Subscribe.findOne({
      user: req.user.id,
    });
    let courses = await Courses.find({
      $or: [
        { _id: { $nin: enroll.courses } },
        { status: "Accepted", user: { $ne: req.user.id } },
      ],
    });
    if (courses) {
      const documents = [];
      var length = courses.length;
      for (let i = 0; i < length; i++) {
        documents.push({ id: courses[i]._id, content: courses[i].name });
      }
      recommender.train(documents);

      res.json({ documents });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
