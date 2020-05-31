const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/Users");
const Token = require("../../models/Token");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const Profile = require("../../models/profile");
// @route   Get api/auth
// @desc    Test route
// @access  public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

router.post("/find", auth, async (req, res) => {
  try {
    const user = await User.find({ _id: { $in: req.body.mid } }).select(
      "-password"
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});
router.get("/welcome", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.roll.toLowerCase() === "teacher") user.roll = "student";
    else user.roll = "teacher";
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentails" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentails" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      // Make sure the user has been verified
      if (!user.isVerified)
        return res.status(401).send({
          type: "not-verified",
          msg: "Your account has not been verified.",
        });

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 }, //3600
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
router.post("/avatar", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { avatar } = req.body;
  //Built Profile object

  if (avatar) {
    avatar = avatar;
  } else {
    avatar =
      "https://res.cloudinary.com/mooc/image/upload/v1590922028/profile/2020-05-31T10:47:02.070Z.jpg";
  }
  try {
    let profile = await User.findById(req.user.id);
    if (profile) {
      profile = await User.findOneAndUpdate(
        { _id: req.user.id },
        { avatar: avatar },
        { new: true }
      );
      return res.json(profile);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post(
  "/confirmation",
  [
    // check("id", "Please include id").exists(),
    check("token", "Token cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      mytoken = req.body.token;
      myid = req.body.id;

      Token.findOne({ token: mytoken }, function (err, token) {
        if (!token)
          return res.status(400).send({
            type: "not-verified",
            msg:
              "We were unable to find a valid token. Your token may have expired.",
          });

        // If we found a token, find a matching user
        User.findOne({ _id: token._userId, _id: myid }, function (err, user) {
          if (!user)
            return res
              .status(400)
              .send({ msg: "We were unable to find a user for this token." });
          if (user.isVerified)
            return res.status(400).send({
              type: "already-verified",
              msg: "This user has already been verified.",
            });

          // Verify and save the user
          user.isVerified = true;
          user.save(function (err) {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            const profile = new Profile({ user: user._id });
            //added something risky
            profile.save(function (err) {
              if (err) {
                return res.status(500).send({ msg: err.message });
              }
            });

            const payload = {
              user: {
                id: user.id,
              },
            };
            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: 360000 }, //3600
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
            );
          });
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/confirmToken",
  [
    check("email", "Please include a valid email").isEmail(),
    check("token", "Token cannot be blank").exists(),
    check("password", "Password with length of min 8 charachters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      mytoken = req.body.token;
      myid = req.body.email;
      password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      mypassword = await bcrypt.hash(password, salt);
      Token.findOne({ token: mytoken }, function (err, token) {
        if (!token)
          return res.status(400).send({
            type: "not-verified",
            msg:
              "We were unable to find a valid token. Your token may have expired.",
          });

        // If we found a token, find a matching user
        User.findOne({ _id: token._userId, email: myid }, function (err, user) {
          if (!user)
            return res
              .status(400)
              .send({ msg: "We were unable to find a user for this token." });

          user.password = mypassword;
          user.save(function (err) {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            const payload = {
              user: {
                id: user.id,
              },
            };
            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: 360000 }, //3600
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
            );
          });
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/resend",
  [check("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //See if user exists
      User.findOne({ email: req.body.email }, function (err, user) {
        console.log(user);

        if (!user)
          return res
            .status(400)
            .send({ msg: "We were unable to find a user with that email." });

        // Create a verification token, save it, and send email
        var token = new Token({
          _userId: user._id,
          token: crypto.randomBytes(16).toString("hex"),
        });
        console.log(token);
        // Save the token
        token.save(function (err) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          console.log(req.body.email);
          // Send the email
          var gmailAuth = {
            type: "oauth2",
            user: "buzilightyear@gmail.com",
            clientId:
              "836527539897-kq0bmenlq2di41hl4jqu9hvsbc2ivrep.apps.googleusercontent.com",
            clientSecret: "yBhlDxp9uPUR9fhA9pfnSsvB",
            refreshToken:
              "1//04uXNYt2b4UJ5CgYIARAAGAQSNwF-L9IrXL0om-bzMbXvMW8McoVay1XnnTm3WZZQBVCuk7EWkyqzczbHrvCwxqVaxn8DuTQRZOw",
          };
          // Send the email
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: gmailAuth,
          });
          var mailOptions = {
            from: "MOOC <buzilightyear@gmail.com>",
            to: user.email,
            subject: "Account Verification Token",
            text:
              "Hello,\n\n" +
              "Please enter this pascode\n\n" +
              token.token +
              ".\n",
          };
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            res
              .status(200)
              .send(
                "A verification email has been sent to " + user.email + "."
              );
          });
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/search", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { searchItem, currentPage, perPage } = req.body;
  const cPage = currentPage - 1;
  try {
    let search = await User.find({
      _id: { $ne: req.user.id },
      roll: { $ne: "admin" },
      name: { $regex: searchItem, $options: "i" },
      isVerified: true,
    });
    if (!search) {
      return res.status(400).json({ errors: [{ msg: "No search found" }] });
    }
    const totalPage = search.length / perPage;
    search = await User.find({
      _id: { $ne: req.user.id },
      roll: { $ne: "admin" },
      name: { $regex: searchItem, $options: "i" },
      isVerified: true,
    })
      .limit(perPage)
      .skip(perPage * cPage)
      .sort({
        name: "asc",
      });
    return res.json({ search, totalPage });

    // let profile = await Profile.find({ user: search }).populate("user", [
    //   "name",
    //   "avatar",
    //   "roll"
    // ]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
router.post(
  "/changePassword",
  [
    check("password", "Please include a password").exists(),
    check("cpassword", "Please include a Confirm password").exists(),
    check("id", "Please include a id").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.body;

    try {
      const password = req.body.password;
      let user = await User.findOne({ _id: req.body.id });
      if (user) {
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentails" }] });
        }
        const salt = await bcrypt.genSalt(10);
        const newpass = req.body.cpassword;
        const newpassword = await bcrypt.hash(newpass, salt);
        user = await User.findOneAndUpdate(
          { _id: req.body.id },
          { password: newpassword },
          { new: true }
        );
        return res.json({ errors: [{ msg: "Done" }] });
      }

      res.json("msg: user not found");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
