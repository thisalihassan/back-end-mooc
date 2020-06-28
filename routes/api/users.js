const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { check, validationResult } = require("express-validator");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const User = require("../../models/Users");
const Token = require("../../models/Token");
// @route   POST api/users
// @desc    Register user
// @access  public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("roll", "Roll is required").not().isEmpty(),
    check("password", "Password with length of min 8 charachters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, roll, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        roll,
        password,
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //await user.save();
      // Create a verification token for this user
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        // Create a verification token for this user
        var token = new Token({
          _userId: user._id,
          token: crypto.randomBytes(16).toString("hex"),
        });

        // Save the verification token
        token.save(function (err) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
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
              "Please verify your account by clicking the link: \nhttps://moocfyp.herokuapp.com/conformation/?id=" +
              user._id +
              "\n\nYour Token: " +
              token.token +
              "\n",
          };
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              return res.status(500).send({ msghere: err.message });
            }
            res.status(200).send(user._id);
          });
        });
      });
      // const payload = {
      //   user: {
      //     id: user.id
      //   }
      // };

      // jwt.sign(
      //   payload,
      //   config.get("jwtSecret"),
      //   { expiresIn: 360000 }, //3600
      //   (err, token) => {
      //     if (err) throw err;
      //     res.json({ token });
      //   }
      // );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
