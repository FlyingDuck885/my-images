// index.js
const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ======= ENVIRONMENT VARIABLES REQUIRED =======
// CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN
// Set these in Railway Project Settings → Variables
// ==============================================
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Send email function
async function sendEmail(toEmail, otp) {
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const messageParts = [
      `To: ${toEmail}`,
      "Subject: Your EcoVision OTP",
      "",
      `Your OTP is: ${otp}`,
    ];

    const message = messageParts.join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return res.data;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}

// API endpoint to send OTP
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "email and otp required" });
  }

  try {
    const result = await sendEmail(email, otp);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Use Railway dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ OTP mailer server running on port ${PORT}`));

