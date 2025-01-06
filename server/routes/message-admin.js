const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// קריאת כל ההודעות
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM messageAdmin");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("שגיאה בקריאת ההודעות");
  }
});

// הוספת הודעה חדשה
router.post("/", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).send("תוכן ההודעה נדרש");
    }
    const [result] = await pool.query(
      "INSERT INTO messageAdmin (content) VALUES (?)",
      [content]
    );
    const newMessage = { id: result.insertId, content };
    res.json(newMessage);
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).send("שגיאה בהוספת ההודעה");
  }
});

// עדכון הודעה לפי ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).send("תוכן ההודעה נדרש");
    }
    const [result] = await pool.query(
      "UPDATE messageAdmin SET content = ? WHERE id = ?",
      [content, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("הודעה לא נמצאה");
    }
    res.json({ id, content });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).send("שגיאה בעדכון ההודעה");
  }
});

// מחיקת הודעה לפי ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM messageAdmin WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).send("הודעה לא נמצאה");
    }
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).send("שגיאה במחיקת ההודעה");
  }
});

module.exports = router;
