import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const data = await resend.emails.send({
      from: "EcoVision <onboarding@resend.dev>", // use this for testing
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log("✅ OTP mailer running on port", process.env.PORT || 8080)
);
