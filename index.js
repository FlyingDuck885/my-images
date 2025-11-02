const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load environment variables (you'll add these in Railway)
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_APP_PASSWORD = process.env.SENDER_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

// Endpoint to send OTP
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Missing fields" });
  res.json({ success: true, message: `OTP sent to ${email}` });
});


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
    res.status(200).json({ success: true, info });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ OTP mailer running on port ${PORT}`));

