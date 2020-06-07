const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Courses = require("../../models/Courses");
const fs = require("fs");
const Subscribe = require("../../models/Subscribe");
const auth = require("../../middleware/auth");
const ContentBasedRecommender = require("content-based-recommender");
const recommender = new ContentBasedRecommender({
  minScore: 0.15,
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
    fs.readFile("user.json", "utf-8", async (err, data) => {
      if (err) {
        throw err;
      }
      // parse JSON object
      const user = JSON.parse(data.toString());
      recommender.import(user);
      const recommendations = [];
      let length = enroll.courses.length;
      let mycouses = enroll.courses;
      for (let i = 0; i < length; i++) {
        const similarDocuments = recommender.getSimilarDocuments(
          mycouses[i],
          0,
          10
        );
        for (let j = 0; j < similarDocuments.length; j++) {
          let match = false;
          for (let k = 0; k < length; k++) {
            if (similarDocuments[j].id == mycouses[k]) {
              match = true;
              break;
            }
          }
          if (!match) {
            recommendations.push(similarDocuments[j].id);
          }
        }
      }
      let courses = await Courses.find({
        user: req.user.id,
      });
      let tuned = [];
      for (let j = 0; j < recommendations.length; j++) {
        let match = false;
        for (let k = 0; k < courses.length; k++) {
          if (recommendations[j] == courses[k]._id) {
            match = true;
            break;
          }
        }
        if (!match) {
          tuned.push(recommendations[j]);
        }
      }
      courses = await Courses.find({
        _id: { $in: tuned },
      });
      res.json({ courses });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/likecourses", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let enroll = await Subscribe.findOne({
      user: req.user.id,
    });
    fs.readFile("user.json", "utf-8", async (err, data) => {
      if (err) {
        throw err;
      }
      // parse JSON object
      const user = JSON.parse(data.toString());
      recommender.import(user);
      const recommendations = [];
      const similarDocuments = recommender.getSimilarDocuments(
        req.body.id,
        0,
        10
      );
      if (enroll) {
        let length = enroll.courses.length;
        let mycouses = enroll.courses;

        for (let j = 0; j < similarDocuments.length; j++) {
          let match = false;
          for (let k = 0; k < length; k++) {
            if (similarDocuments[j].id == mycouses[k]) {
              match = true;
              break;
            }
          }
          if (!match) {
            recommendations.push(similarDocuments[j].id);
          }
        }
      } else {
        for (let j = 0; j < similarDocuments.length; j++) {
          recommendations.push(similarDocuments[j].id);
        }
      }
      let courses = await Courses.find({
        user: req.user.id,
      });
      let tuned = [];
      if (courses) {
        for (let j = 0; j < recommendations.length; j++) {
          let match = false;
          for (let k = 0; k < courses.length; k++) {
            if (recommendations[j] == courses[k]._id) {
              match = true;
              break;
            }
          }
          if (!match) {
            tuned.push(recommendations[j]);
          }
        }
        courses = await Courses.find({
          _id: { $in: tuned },
        });
        res.json({ courses });
      } else {
        courses = await Courses.find({
          _id: { $in: recommendations },
        });
        res.json({ courses });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
