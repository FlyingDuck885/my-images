const express = require("express");
const fs = require("fs");
const { google } = require("googleapis");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const CREDENTIALS = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
};

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = "token.json";

const { client_id, client_secret, redirect_uris } = CREDENTIALS;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load saved token if exists
if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
}

// Send email function
function sendEmail(auth, toEmail, otp) {
  const gmail = google.gmail({ version: "v1", auth });

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

  return gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
}

// API endpoint
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "email and otp required" });

  try {
    const result = await sendEmail(oAuth2Client, email, otp);
    res.json({ success: true, data: result.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Use Railway dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ OTP mailer server running on port ${PORT}`));
