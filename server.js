const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cloudinary = require("./cludinary");
const {
  uploadFiles,
  uploadprofile,
  uploadcourse,
  multer,
} = require("./handlebars");
connectDB();

const cors = require("cors");

const corsOptions = {
  Origin: "https://moocback.herokuapp.com/",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};
app.use(cors(corsOptions));
//Init Middleware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", true);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );
  // Set to true if you need the website to include cookies in the requests sent
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.send("Running");
});
// Define ROutes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/assignment", require("./routes/api/assignment"));
app.use("/api/subscribe", require("./routes/api/subscribe"));
app.use("/api/Message", require("./routes/api/Message"));
app.use("/api/Courses", require("./routes/api/Courses"));
app.use("/api/notifications", require("./routes/api/notifications"));
app.use("/api/quiz", require("./routes/api/quiz"));
app.use("/api/complaint", require("./routes/api/complaint"));
app.use("/api/room", require("./routes/api/myRoom"));

app.post("/upload", async function (req, res) {
  uploadprofile(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    try {
      const path = req.file.path;
      const uniqueFilename = new Date().toISOString();
      const result = await cloudinary.uploader.upload(path, {
        public_id: `profile/${uniqueFilename}`,
      });
      url = result.secure_url;
      return res.json(url);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
});

app.post("/lecturefiles", async (req, res) => {
  await uploadFiles(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err2);
    }
    try {
      const upload_len = req.files.length;
      const files = req.files;
      let url = new Array();
      for (let i = 0; i <= upload_len + 1; i++) {
        if (url.length === upload_len) {
          return res.json(url);
        }
        const path = files[i].path;
        const uniqueFilename = new Date().toISOString();
        const result = await cloudinary.uploader.upload(path, {
          resource_type: "auto",
          public_id: `lectures/${uniqueFilename}`,
        });
        if (result) {
          url.push(result.secure_url);
        }
        console.log(url);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
});

app.post("/coursepic", async (req, res) => {
  uploadcourse(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err2);
    }
    try {
      const path = req.file.path;
      const uniqueFilename = new Date().toISOString();
      const result = await cloudinary.uploader.upload(path, {
        public_id: `CourseImages/${uniqueFilename}`,
      });
      url = result.secure_url;

      console.log(url);
      return res.json(url);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
});

let http;
exports.http = http = require("http").createServer(app);
require("./socket");
const PORT = process.env.PORT || 5000;

http.listen(PORT, function () {
  console.log("listening on *:5000");
});
