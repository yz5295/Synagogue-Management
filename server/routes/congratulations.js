const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM congratulations");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה בשליפת הודעות" });
  }
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "הודעה אינה יכולה להיות ריקה" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO congratulations (message) VALUES (?)",
      [message]
    );
    const newMessage = {
      id: result.insertId,
      message,
    };
    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה בהוספת הודעה" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "הודעה אינה יכולה להיות ריקה" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE congratulations SET message = ? WHERE id = ?",
      [message, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "הודעה לא נמצאה" });
    }

    res.json({ id, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה בעריכת הודעה" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM congratulations WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "הודעה לא נמצאה" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה במחיקת הודעה" });
  }
});

module.exports = router;
