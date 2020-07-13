const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./routes/api/room");
const { app } = require("./server");
const { http } = require("./server");
const io = require("socket.io")(http);
const axios = require("axios");
const Room = require("./models/Room");
io.on("connect", (socket) => {
  socket.on("join", ({ name, myroom, check, id }, callback) => {
    console.log(myroom);
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
  app.post("/getModal", async (req, res) => {
    try {
      let { id, user } = req.body;

      let room = await Room.findOne({
        _id: id,
      });
      let match = user == room.user;
      socket.broadcast.emit("calloff", {
        course: room.course,
        user: room.user,
        id: id,
        ownerclose: match,
      });
      return res.json(id);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
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
    const { name, room, zoom, courseID, userid } = tuple;
    try {
      socket.broadcast.emit("VideoCallRinging", {
        name: name,
        userid: userid,
        courseID: courseID,
        zoom: zoom,
        room: room,
      });
    } catch (error) {}

    callback();
  });
  socket.on("ScreenSharing", (tuple, callback) => {
    const { name, room, courseID, userid } = tuple;
    try {
      socket.broadcast.emit("ScreenShareCall", {
        name: name,
        userid: userid,
        courseID: courseID,
        room: room,
      });
    } catch (error) {}

    callback();
  });
  socket.on("AudioCall", (tuple, callback) => {
    const { name, room, courseID, userid } = tuple;
    try {
      socket.broadcast.emit("AudioCallRinging", {
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
      follower: data.follower,
      message: data.message,
      anouncements: data.anouncements,
      user: data.user,
      course: data.course,
      assignment: data.assignment,
      quiz: data.quiz,
    });
  });
});
module.exports = io;
