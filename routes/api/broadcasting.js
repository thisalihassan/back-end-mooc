const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
var Pusher = require("pusher");
export const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.APP_SECRET,
  cluster: process.env.APP_CLUSTER
});

router.post("/auth", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    console.log("authing...");
    var auth = pusher.authenticate(socketId, channel);
    return res.send(auth);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
