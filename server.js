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
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./routes/api/room");

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

// app.get("/mp4video/:name", function (req, res) {
//   const name = req.params.name;
//   const path = "ClientStart/src/assets/lectures/" + name;
//   const stat = fs.statSync(path);
//   const fileSize = stat.size;
//   const range = req.headers.range;
//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-");
//     const start = parseInt(parts[0], 10);
//     const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     const chunksize = end - start + 1;
//     const file = fs.createReadStream(path, { start, end });
//     const head = {
//       "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": chunksize,
//       "Content-Type": "video/mp4",
//     };
//     res.writeHead(206, head);
//     file.pipe(res);
//   } else {
//     const head = {
//       "Content-Length": fileSize,
//       "Content-Type": "video/mp4",
//     };
//     res.writeHead(200, head);
//     fs.createReadStream(path).pipe(res);
//   }
// });

// app.get("/avivideo/:name", function (req, res) {
//   const name = req.params.name;
//   const path = "ClientStart/src/assets/lectures/" + name;
//   const stat = fs.statSync(path);
//   const fileSize = stat.size;
//   const range = req.headers.range;
//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-");
//     const start = parseInt(parts[0], 10);
//     const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     const chunksize = end - start + 1;
//     const file = fs.createReadStream(path, { start, end });
//     const head = {
//       "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": chunksize,
//       "Content-Type": "video/ogg",
//     };
//     res.writeHead(206, head);
//     file.pipe(res);
//   } else {
//     const head = {
//       "Content-Length": fileSize,
//       "Content-Type": "video/ogg",
//     };
//     res.writeHead(200, head);
//     fs.createReadStream(path).pipe(res);
//   }
// });

const PORT = process.env.PORT || 5000;

//const app2 = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const axios = require("axios");

io.on("connect", (socket) => {
  socket.on("join", ({ name, myroom, check, id }, callback) => {
    const { error, user } = addUser({ id: id, name, myroom, check });
    if (error) return callback(error);
    socket.join(user.room);
    io.to(myroom).emit("roomData", {
      users: getUsersInRoom(myroom),
    });

    callback();
  });

  socket.on("sendMessage", (tuple, callback) => {
    const { myroom, msg, check, id, timeStamp } = tuple;
    let room = myroom;
    if (!check) {
      room = myroom[0] + "" + myroom[1];
    }

    try {
      const theUser = getUser(room, id);
      const text = msg;
      const user = theUser.name;
      const Message = { user, text, timeStamp };
      const config = { headers: { "Content-Type": "application/json" } };
      const body = JSON.stringify({ room, Message });
      axios.post(
        "https://moocback.herokuapp.com/api/message/SendMessage",
        body,
        config
      );
      io.to(theUser.room).emit("message", {
        room: theUser.room,
        user: theUser.name,
        text: msg,
        timeStamp: timeStamp,
      });
    } catch (error) {}

    callback();
  });
  socket.on("CallRing", (tuple, callback) => {
    const { name, userid, URL } = tuple;

    console.log("Here");
    try {
      socket.broadcast.emit("CallRinging", {
        name: name,
        userid: userid,
        URL: URL,
      });
    } catch (error) {}

    callback();
  });
  socket.on("VideoCall", (tuple, callback) => {
    const { name, room, courseID, userid } = tuple;

    console.log("Here");
    try {
      socket.broadcast.emit("VideoCallRinging", {
        name: name,
        userid: userid,
        courseID: courseID,
        room: room,
      });
    } catch (error) {}

    callback();
  });
  socket.on("kickuser", (tuple, callback) => {
    const { myroom, id, name } = tuple;
    removeUser(myroom, id);

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const body = JSON.stringify({ myroom, id });
      axios.post("https://moocback.herokuapp.com/api/room/kick", body, config);
    } catch (error) {}
    io.to(myroom).emit("roomData", {
      users: getUsersInRoom(myroom),
    });
    io.to(myroom).emit("userNavigate", {
      user: id,
    });
    io.to(myroom).emit("message", {
      text: `${name} has been kicked out of the room for 30min.`,
    });
    callback();
  });

  socket.on("disconnectuser", (tuple, callback) => {
    const { myroom, id, name } = tuple;
    removeUser(myroom, id);
    io.to(myroom).emit("roomData", {
      users: getUsersInRoom(myroom),
    });

    io.to(myroom).emit("message", {
      text: `${name} has left the Room.`,
    });
    callback();
  });
});

io.on("connection", function (socket) {
  socket.on("new_notification", function (data) {
    // const anouncements = data.body.anouncements;
    // const assignment = data.body.assignment;
    // const quiz = data.body.quiz;
    // const user = data.body.user;
    // const course = data.course;
    // const body = JSON.stringify({
    //   anouncements,
    //   assignment,
    //   quiz,
    //   user,
    //   course
    // });
    try {
      const body = data.body;
      const config = { headers: { "Content-Type": "application/json" } };
      axios.post(
        "https://moocback.herokuapp.com/api/notifications/",
        body,
        config
      );
    } catch (error) {
      console.log(error);
    }
    socket.broadcast.emit("show_notification", {
      message: data.message,
      anouncements: data.anouncements,
      user: data.user,
      course: data.course,
      assignment: data.assignment,
      quiz: data.quiz,
    });
  });
});

http.listen(PORT, function () {
  console.log("listening on *:5000");
});
