const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("../middleware/authToken");
require("dotenv").config();
const router = express.Router();
const pool = require("../config/db");

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    console.log("Database connected! Test result:", rows[0].solution);
  } catch (err) {
    console.error("Failed to connect to the database:", err);
  }
})();

const SECRET_KEY = process.env.SECRET_KEY;

router.get("/", authToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }

    res.json({
      message: "בקשה הצליחה",
      token: req.token,
      user: results[0],
    });
  } catch (err) {
    console.error("שגיאה בשליפת נתונים:", err);
    res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    console.error("שגיאה בשליפת נתונים:", err);
    res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

router.post("/", async (req, res) => {
  const newUser = req.body;
  if (!newUser.password) {
    return res.status(400).json({ error: "סיסמה היא שדה חובה" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const query = `
      INSERT INTO users (first_name, last_name, address, city, phone, email, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        address = VALUES(address),
        city = VALUES(city),
        phone = VALUES(phone),
        email = VALUES(email),
        password = VALUES(password)
    `;

    await pool.query(query, [
      newUser.firstName,
      newUser.lastName,
      newUser.address,
      newUser.city,
      newUser.phone,
      newUser.email,
      hashedPassword,
    ]);

    res.status(201).json(newUser);
  } catch (err) {
    console.error("שגיאה בהוספת משתמש:", err);
    res.status(500).json({ error: "שגיאה בהוספת משתמש" });
  }
});

router.put("/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, address, city, phone, email, password } =
    req.body;

  try {
    const fields = [
      "first_name",
      "last_name",
      "address",
      "city",
      "phone",
      "email",
    ];
    const values = [first_name, last_name, address, city, phone, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password");
      values.push(hashedPassword);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    const params = [...values, id];

    const [updateResult] = await pool.query(query, params);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }

    res.json({ message: "פרטי המשתמש עודכנו בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון נתונים:", err);
    res.status(500).json({ error: "שגיאה בעדכון נתונים" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";

  try {
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "משתמש לא נמצא" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("שגיאה במחיקת משתמש:", err);
    res.status(500).json({ error: "שגיאה במחיקת משתמש" });
  }
});

router.post("/login", async (req, res) => {
  const { fullName, passwordMember } = req.body;

  if (!fullName || !passwordMember) {
    return res.status(400).json({ error: "חובה להזין שם מלא וסיסמה" });
  }

  const nameParts = fullName.trim().split(" ");
  if (nameParts.length < 2) {
    return res
      .status(400)
      .json({ error: "חובה להזין שם פרטי ושם משפחה מלאים" });
  }
  const [first_name, ...last_name_parts] = nameParts;
  const last_name = last_name_parts.join(" ");

  try {
    const query = "SELECT * FROM users WHERE first_name = ? AND last_name = ?";
    const [users] = await pool.query(query, [first_name, last_name]);

    if (users.length === 0) {
      return res.status(404).json({ error: "משתמש לא נמצא" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(passwordMember, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "סיסמה שגויה" });
    }

    const token = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name },
      SECRET_KEY
    );

    res.status(200).json({
      message: "התחברות הצליחה",
      token,
    });
  } catch (err) {
    console.error("שגיאה באימות סיסמה:", err);
    res.status(500).json({ error: "שגיאה באימות סיסמה" });
  }
});

module.exports = router;
