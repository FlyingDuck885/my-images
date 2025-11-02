const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load environment variables
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_APP_PASSWORD = process.env.SENDER_APP_PASSWORD;

// Configure transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

// OTP endpoint
app.post("/send-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "email and otp required",
    });
  }

  const mailOptions = {
    from: `EcoVision <${SENDER_EMAIL}>`,
    to: email,
    subject: "Your EcoVision OTP Code",
    text: `Your EcoVision verification code is: ${otp}\nThis code will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log("✅ Email sent:", info.response);
    return res.status(200).json({ success: true, info });
  });
});

// For Railway dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ OTP mailer server running on port ${PORT}`));
