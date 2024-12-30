const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// הוספת תרומה
router.post("/", async (req, res) => {
  const { amount, purpose, user } = req.body;
  const { first_name, last_name, address, city, phone, email } = user;

  try {
    // בדיקה אם המשתמש כבר קיים
    let [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!existingUser.length) {
      const [result] = await pool.query(
        "INSERT INTO users (first_name, last_name, address, city, phone, email) VALUES (?, ?, ?, ?, ?, ?)",
        [first_name, last_name, address, city, phone, email]
      );
      existingUser = [{ id: result.insertId }];
    }

    // הוספת תרומה
    await pool.query(
      "INSERT INTO donations (user_id, amount, purpose, date) VALUES (?, ?, ?, NOW())",
      [existingUser[0].id, amount, purpose]
    );

    res.status(200).send("התרומה נשמרה בהצלחה");
  } catch (err) {
    console.error(err);
    res.status(500).send("שגיאה בשמירת התרומה");
  }
});

// קבלת רשימת תרומות
router.get("/", async (req, res) => {
  try {
    const [donations] = await pool.query(`
            SELECT 
                 d.id AS donation_id,
                d.user_id,
                d.amount,
                d.purpose,
                d.date,
                u.first_name,
                u.last_name,
                u.phone,
                u.email,
                u.address,
                u.city
            FROM donations d
            JOIN users u ON d.user_id = u.id
        `);

    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "שגיאה בטעינת התרומות" });
  }
});

module.exports = router;
