const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_APP_PASSWORD = process.env.SENDER_APP_PASSWORD;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Setup Gmail transporter for local dev
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

// Setup Resend API client
const resend = new Resend(RESEND_API_KEY);

app.post("/send-otp", async (req, res) => {
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

  try {
    // If running on Railway → use Resend
    if (process.env.RAILWAY_ENVIRONMENT) {
      const data = await resend.emails.send({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
      });
      return res.status(200).json({ success: true, service: "resend", data });
    }

    // Else → use Gmail transporter locally
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, service: "gmail", info });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// For Railway, dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ OTP mailer server running on port ${PORT}`));
