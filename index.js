const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SENDER_EMAIL = "ecovision.app.mobile@gmail.com";
const SENDER_APP_PASSWORD = "osao xcqy xnsk jvag"; // from Step 2

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

// POST /send-otp route
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
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ OTP mailer running on port ${PORT}`));
app.listen(process.env.PORT || 8080, () =>
  console.log("✅ OTP mailer running on port", process.env.PORT || 8080)
);


