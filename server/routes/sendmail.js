const express = require("express"); // ייבוא express
const router = express.Router();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

router.use(cors());
router.use(express.json());

router.post("/email", async (req, res) => {
  const { to, subject, text, senderName } = req.body;

  if (!senderName) {
    return res.status(400).send("Sender name is required");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${senderName} <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

module.exports = router;
