const express = require("express");
const router = express.Router();
const Courses = require("../../models/Courses");
const Anouncement = require("../../models/Anouncements");
const Quiz = require("../../models/Quiz");
const Assignment = require("../../models/Assignment");
const { check, validationResult } = require("express-validator");
const Files = require("../../models/LectureFiles");
const Notification = require("../../models/Notification");
const Room = require("../../models/Room");
const Subscribe = require("../../models/Subscribe");
const FollowCourse = require("../../models/CourseFollower");
const auth = require("../../middleware/auth");
const ContentBasedRecommender = require("content-based-recommender");
const fs = require("fs");
const recommender = new ContentBasedRecommender({
  minScore: 0.15,
  maxSimilarDocuments: 30,
});
//
//update and create
router.post("/", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    importance,
    pic,
    outcome,
    courseContent,
    preReq,
    tags,
    category,
  } = req.body;

  const courseFields = {};
  courseFields.user = req.user.id;
  if (name) courseFields.name = name;
  if (importance) courseFields.importance = importance;
  if (tags) {
    courseFields.tags = tags;
  }
  if (pic) courseFields.pic = pic;
  if (outcome) courseFields.outcome = outcome;
  if (courseContent) courseFields.courseContent = courseContent;
  if (preReq) courseFields.preReq = preReq;
  if (category) courseFields.category = category;
  try {
    if (req.body.id) {
      let course = await Courses.findOneAndUpdate(
        { _id: req.body.id },
        { $set: courseFields },
        { new: true }
      );
      return res.json(course);
    }
    course = new Courses(courseFields);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//delete
router.delete("/delete/:c_id", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let course = await Courses.findOne({ _id: req.params.c_id });
    if (!course) {
      return res.json("Course not Found");
    }
    await Room.findOneAndRemove({ course: req.params.c_id });
    let follow = await Subscribe.find();
    let quiz = await Quiz.find({ course: req.params.c_id });
    if (quiz) {
      for (let i = 0; i < quiz.length; i++) {
        await Quiz.findOneAndRemove({ _id: quiz[i]._id });
      }
    }

    let assign = await Assignment.find({ course: req.params.c_id });
    if (assign) {
      for (let i = 0; i < assign.length; i++) {
        await Assignment.findOneAndRemove({ _id: assign[i]._id });
      }
    }
    if (follow) {
      const length = follow.length;
      for (let i = 0; i < length; i++) {
        follow[i].courses.pull({ _id: req.params.c_id });
        await follow[i].save();
      }

      await FollowCourse.findOneAndRemove({
        course: req.params.c_id,
      });
    }
    await Anouncement.findOneAndRemove({
      course: req.params.c_id,
    });
    await Courses.findByIdAndRemove({ _id: req.params.c_id });
    return res.json(course);
  } catch (err) {
    console.log("ejhrkjs");
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//FindMyCourses
router.post("/mycourses", [auth], async (req, res) => {
  try {
    const courses = await Courses.find({ user: req.user.id });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/uploadFiles", [auth], async (req, res) => {
  try {
    let files = await Files.findOne({ course: req.body.id });
    let course = req.body.id;

    if (!files) {
      files = new Files({
        course: course,
      });
      files.lecturefiles.push({
        files: req.body.files,
        fileNames: req.body.fileNames,
        lecture: req.body.lecture,
      });
      await files.save();
      return res.json(files);
    }
    files.lecturefiles.push({
      files: req.body.files,
      fileNames: req.body.fileNames,
      lecture: req.body.lecture,
    });
    await files.save();
    return res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/uploadStream", async (req, res) => {
  try {
    let { room, url } = req.body;
    console.log("here");
    let getID = await Room.findOne({ _id: room });
    let files = await Files.findOne({ course: getID.course });
    let course = getID.course;
    var d = new Date();
    var n = d.toString().split("2020");
    if (!files) {
      files = new Files({
        course: course,
      });

      files.lecturefiles.push({
        files: url,
        fileNames: "Lecture 1.webm",
        lecture: "Video Broadcast on " + n[0] + " 2020",
      });
      await files.save();
      return res.json(files);
    }
    const le = files.lecturefiles.length + 1;
    files.lecturefiles.push({
      files: url,
      fileNames: "Lecture " + le + ".webm",
      lecture: "Video Broadcast on " + n[0] + " 2020",
    });
    await files.save();
    return res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/EditFiles", [auth], async (req, res) => {
  try {
    let files = await Files.findOne({ "lecturefiles._id": req.body.id }).select(
      {
        lecturefiles: {
          $elemMatch: {
            _id: req.body.id,
          },
        },
      }
    );
    if (files.lecturefiles[0].files.length === 1) {
      files = await Files.findOne({ "lecturefiles._id": req.body.id });
      files.lecturefiles.pull({ _id: req.body.id });
      await files.save();
      return res.json(files);
    }

    const filtered = files.lecturefiles[0].files.filter(function (
      value,
      index,
      arr
    ) {
      return value !== req.body.item;
    });
    files = await Files.updateOne(
      { "lecturefiles._id": req.body.id },
      {
        $set: {
          "lecturefiles.$.files": filtered,
        },
      },
      { new: true }
    );
    return res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/editLecture", [auth], async (req, res) => {
  try {
    let files = await Files.findOne({ "lecturefiles._id": req.body.id }).select(
      {
        lecturefiles: {
          $elemMatch: {
            _id: req.body.id,
          },
        },
      }
    );
    if (req.body.check) {
      return res.json(files.lecturefiles[0].lecture);
    }

    files = await Files.updateOne(
      { "lecturefiles._id": req.body.id },
      {
        $set: {
          "lecturefiles.$.lecture": req.body.lecture,
        },
      },
      { new: true }
    );
    return res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getFiles", [auth], async (req, res) => {
  try {
    let files = await Files.findOne({ course: req.body.id });

    if (files) {
      return res.json(files.lecturefiles);
    }
    return res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getcourses", async (req, res) => {
  try {
    const courses = await Courses.find({
      user: req.body.id,
      Approval: "Active",
    });
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/myourses", [auth], async (req, res) => {
  try {
    const courses = await Courses.find({
      user: req.user.id,
      Approval: "Active",
    });
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/pending", [auth], async (req, res) => {
  try {
    const courses = await Courses.find({ Approval: "Pending" }).populate(
      "user",
      ["name", "avatar"]
    );
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/active", [auth], async (req, res) => {
  try {
    const courses = await Courses.find({ Approval: "Active" });
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//FindCourse
router.post("/mycourse", async (req, res) => {
  try {
    const courses = await Courses.findById({
      _id: req.body.id,
    });
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/topcourses", [auth], async (req, res) => {
  try {
    const courses = await Courses.find({}).sort({ subscribers: -1 }).limit(12);
    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/topcoursesbycat", async (req, res) => {
  try {
    const courses = await Courses.find({ category: req.body.category })
      .sort({ subscribers: -1 })
      .limit(5);

    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/searchbycat", async (req, res) => {
  try {
    const courses = await Courses.find({ category: req.body.category });

    return res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.get("/acceptcourse/:id", [auth], async (req, res) => {
  try {
    let activate = await Courses.findOneAndUpdate(
      { _id: req.params.id },
      { Approval: "Active" },
      { new: true }
    );
    let courses = await Courses.find({
      Approval: "Active",
    });
    let documents;
    if (courses) {
      documents = [];
      let length = courses.length;
      for (let i = 0; i < length; i++) {
        let tags = "";
        for (let j = 0; j < courses[i].tags.length; j++) {
          tags = tags + " " + courses[i].tags[j];
        }
        documents.push({
          id: courses[i]._id,
          content: courses[i].name + " " + courses[i].category + " " + tags,
        });
      }
      recommender.train(documents);
      const object = recommender.export();
      const data = JSON.stringify(object);

      // write JSON string to a file
      fs.writeFile("user.json", data, (err) => {
        if (err) {
          throw err;
        }
        console.log("JSON data is saved.");
      });
    }
    return res.json(activate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.get("/remove/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let anounce = await Anouncement.findOne({
      "anouncement._id": req.params.id,
    });
    let notify = await Notification.find({
      "notification.anouncements": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id = notify[i].notification.filter(
          (x) => x.anouncements == req.params.id
        );
        id = id[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id,
        });
        notify2.notification.pull({ _id: id });
        await notify2.save();
      }
    }

    if (anounce) {
      if (anounce.anouncement.length === 1) {
        await Anouncement.findOneAndRemove({
          "anouncement._id": req.params.id,
        });
        return res.json({ msg: "Anouncement deleted" });
      }
      anounce.anouncement.pull({ _id: req.params.id });
      await anounce.save();
      return res.json({ msg: "Anouncement deleted" });
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
    const { description } = req.body;
    let notify = await Notification.find({
      "notification.anouncements": req.params.id,
    });
    if (notify) {
      for (let i = 0; i < notify.length; i++) {
        let id = notify[i].notification.filter(
          (x) => x.anouncements == req.params.id
        );
        id = id[0]._id;

        let notify2 = await Notification.findOne({
          "notification._id": id,
        });
        notify2.notification.pull({ _id: id });
        await notify2.save();
      }
    }
    let assign = await Anouncement.updateOne(
      { "anouncement._id": req.params.id },
      {
        $set: {
          "anouncement.$.description": description,
        },
      },
      { new: true }
    );
    assign = await Anouncement.findOne({
      "anouncement._id": req.params.id,
    }).select({
      anouncement: {
        $elemMatch: {
          _id: req.params.id,
        },
      },
    });
    return res.json(assign.anouncement[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getanouncement/:id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let assign = await Anouncement.findOne({
      "anouncement._id": req.params.id,
    })
      .select({
        anouncement: {
          $elemMatch: {
            _id: req.params.id,
          },
        },
      })
      .populate("course", ["name"]);
    return res.json(assign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/addanouncement", [auth], async (req, res) => {
  try {
    const { course, description } = req.body;
    let anounce = await Anouncement.findOne({
      user: req.user.id,
      course: course,
    });
    const anouncement = {};
    anouncement.description = description;
    if (anounce) {
      assign = await Anouncement.findOneAndUpdate(
        { course: course },
        { $push: { anouncement: anouncement } },
        { new: true }
      );
      return res.json(anounce);
    }
    const myanounce = {};
    myanounce.user = req.user.id;
    myanounce.course = course;
    myanounce.anouncement = anouncement;
    anounce = new Anouncement(myanounce);
    await anounce.save();
    return res.json(anounce.anouncement[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/search", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { searchItem, currentPage, perPage } = req.body;
  const cPage = currentPage - 1;
  try {
    let search = await Courses.find({
      Approval: { $ne: "Pending" },
      name: { $regex: searchItem, $options: "i" },
    });
    if (!search) {
      return res.status(400).json({ errors: [{ msg: "No search found" }] });
    }
    const totalPage = search.length / perPage;
    search = await Courses.find({
      Approval: { $ne: "Pending" },
      name: { $regex: searchItem, $options: "i" },
    })
      .limit(perPage)
      .skip(perPage * cPage)
      .sort({
        name: "asc",
      });
    return res.json({ search, totalPage });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/getanounce", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { course, roll, currentPage, perPage } = req.body;
    const cPage = currentPage - 1;
    if (roll === "student") {
      let anounce = await Anouncement.find({
        course: { $in: course },
      });
      const totalPage = anounce.length;
      anounce = await Anouncement.find({
        course: { $in: course },
      })
        .limit(perPage)
        .skip(perPage * cPage)
        .sort({
          date: "desc",
        })
        .populate("course", ["name"]);
      return res.json({ anounce, totalPage });
    } else {
      let anounce = await Anouncement.find({
        user: req.user.id,
      });
      const totalPage = anounce.length;
      anounce = await Anouncement.find({
        user: req.user.id,
      })
        .limit(perPage)
        .skip(perPage * cPage)
        .sort({
          date: "desc",
        })
        .populate("course", ["name"]);
      return res.json({ anounce, totalPage });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
