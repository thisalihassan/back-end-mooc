const express = require("express");
const connectDB = require("./config/db");
const app = express();
const path = require("path");
const mime = require("mime");
const fs = require("fs");

connectDB();
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./routes/api/room");

const cors = require("cors");
var multer = require("multer");
var profilepic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ClientStart/src/assets/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var coursepic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ClientStart/src/assets/Courseimages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var lecturefiles = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ClientStart/src/assets/lectures");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const corsOptions = {
  Origin: "http://localhost:5000/",
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
var uploadFiles = multer({ storage: lecturefiles }).any();
var uploadprofile = multer({ storage: profilepic }).single("file");
var uploadcourse = multer({ storage: coursepic }).single("file");

app.get("/downloadfile/:name", function (req, res) {
  const name = req.params.name;
  var file = `ClientStart/src/assets/lectures/${name}`;

  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader("Content-disposition", "attachment; filename=" + filename);
  res.setHeader("Content-type", mimetype);

  // var filestream = fs.createReadStream(file);
  // filestream.pipe(res);
  // window.open(file);
  res.download(file);
});

app.post("/upload", function (req, res) {
  uploadprofile(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file);
  });
});
// app.get("/downloads", function(req, res) {
//   console.log("here");
//   const file = `/assests/lectures/${req.body.item}`;
//   res.download(file); // Set disposition and send it.
// });
app.post("/lecturefiles", function (req, res) {
  uploadFiles(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err2);
    }
    return res.status(200).send(req.files);
  });
});

app.post("/coursepic", function (req, res) {
  uploadcourse(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err2);
    }
    return res.status(200).send(req.file);
  });
});

app.get("/mp4video/:name", function (req, res) {
  const name = req.params.name;
  const path = "ClientStart/src/assets/lectures/" + name;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get("/avivideo/:name", function (req, res) {
  const name = req.params.name;
  const path = "ClientStart/src/assets/lectures/" + name;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/ogg",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/ogg",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

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
    //console.log(socket);
    // socket.emit("message", {
    //   user: "admin",
    //   text: `${user.name}, welcome to room ${user.room}.`
    // });
    // if (check) {
    //   socket.broadcast
    //     .to(user.room)
    //     .emit("message", { user: `${user.name}`, text: ` has joined!` });
    // }

    callback();
  });

  socket.on("sendMessage", (tuple, callback) => {
    const { myroom, msg, check, id } = tuple;
    let room = myroom;
    if (!check) {
      room = myroom[0] + "" + myroom[1];
    }
    const theUser = getUser(room, id);
    const text = msg;
    console.log(theUser);
    const user = theUser.name;
    const Message = { user, text };
    const config = { headers: { "Content-Type": "application/json" } };
    const body = JSON.stringify({ room, Message });
    try {
      // const response =
      axios.post("http://localhost:5000/api/message/SendMessage", body, config);
      // console.log(response.data);
    } catch (error) {}
    io.to(theUser.room).emit("message", {
      room: theUser.room,
      user: theUser.name,
      text: msg,
    });
    callback();
  });

  socket.on("kickuser", (tuple, callback) => {
    const { myroom, id, name } = tuple;
    removeUser(myroom, id);

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const body = JSON.stringify({ myroom, id });
      axios.post("http://localhost:5000/api/room/kick", body, config);
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
      axios.post("http://localhost:5000/api/notifications/", body, config);
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
