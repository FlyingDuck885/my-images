// index.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === CONFIGURE THESE ===
// Replace with your Gmail address and the App Password you created in Google Account.
const SENDER_EMAIL = "ecovision.app.mobile@gmail.com";
const SENDER_APP_PASSWORD = "osao xcqy xnsk jvag";
// =======================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD
  },
});

app.post("/send-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "email and otp required" });
  }

  const mailOptions = {
    from: `EcoVision <${SENDER_EMAIL}>`,
    to: email,
    subject: "Your EcoVision OTP Code",
    text: `Your EcoVision verification code is: ${otp}\nThis code will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(200).json({ success: true, info });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`OTP mailer server running on port ${PORT}`));
