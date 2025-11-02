const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "email and otp required" });
  }

  try {
    const data = await resend.emails.send({
      from: "EcoVision <onboarding@resend.dev>",
      to: email,
      subject: "Your EcoVision OTP Code",
      text: `Your EcoVision verification code is: ${otp}\nThis code will expire in 10 minutes.`,
    });

    console.log("✅ Email sent:", data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ OTP mailer server running on port ${PORT}`));
