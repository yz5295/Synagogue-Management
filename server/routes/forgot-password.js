const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route לשליחת קישור איפוס סיסמה
router.post("/", async (req, res) => {
  const { synagogueName, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "חובה להזין מייל" });
  }

  try {
    // חיפוש המשתמש לפי המייל
    const query = "SELECT * FROM users WHERE email = ?";
    const [users] = await pool.query(query, [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: "מייל לא נמצא" });
    }

    const user = users[0];

    // יצירת טוקן איפוס סיסמה עם JWT
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.WEB_URL}/reset-password/${resetToken}`;

    // שליחת המייל עם הקישור לאיפוס סיסמה
    const mailOptions = {
      from: `בית הכנסת ${synagogueName} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "איפוס סיסמה",
      html: `
          <div style="direction: rtl; font-family: sans-serif; text-align: center; padding: 40px; background-color: #333; color: white;">
            <div style="background-color: white; padding: 30px 20px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
              <h2 style="color: #ffc107; margin-bottom: 20px; font-size: 22px;">איפוס סיסמה</h2>
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">שלום,</p>
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">לחץ על הכפתור למטה כדי לאפס את הסיסמה שלך:</p>
              <a href="${resetLink}" style="display: block; margin: 20px auto; padding: 10px 20px; background-color: #ffc107; color: #333; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                אפס סיסמה
              </a>
            </div>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "קישור לאיפוס סיסמה נשלח למייל שלך" });
  } catch (err) {
    console.error("שגיאה בשליחת המייל:", err);
    res.status(500).json({ error: "שגיאה בשליחת המייל" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "חובה להזין סיסמה חדשה" });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ error: "הטוקן לא תקין או פג תוקף" });
      }

      const query = "SELECT * FROM users WHERE email = ?";
      const [users] = await pool.query(query, [decoded.email]);

      if (users.length === 0) {
        return res.status(404).json({ error: "לא נמצא משתמש עם מייל זה" });
      }

      const user = users[0];

      // עדכון הסיסמה
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
      await pool.query(updateQuery, [hashedPassword, user.id]);

      res.json({ message: "הסיסמה עודכנה בהצלחה" });
    });
  } catch (err) {
    console.error("שגיאה באיפוס סיסמה:", err);
    res.status(500).json({ error: "שגיאה באיפוס סיסמה" });
  }
});

module.exports = router;
