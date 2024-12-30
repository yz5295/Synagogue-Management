const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/sendMessage", async (req, res) => {
  try {
    const { subject, text, user_id } = req.body;
    const [result] = await pool.query(
      "INSERT INTO messages (subject, text, timestamp, user_id) VALUES (?, ?, NOW(), ?)",
      [subject, text, user_id]
    );
    res.status(200).json({ success: true, message_id: result.insertId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        m.id AS message_id,
        m.subject,
        m.text,
        m.timestamp,
        m.read_boolean,
        m.archived,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.address,
        u.city,
        u.email
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.archived = 0
      ORDER BY m.timestamp DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/archive", async (req, res) => {
  try {
    const { id } = req.body;
    const [result] = await pool.query(
      "UPDATE messages SET archived = 1 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error archiving message:", error);
    res.status(500).json({ error: "Failed to archive message" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { read_boolean } = req.body;
    const [result] = await pool.query(
      "UPDATE messages SET read_boolean = ? WHERE id = ?",
      [read_boolean, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ error: "Failed to update message status" });
  }
});

module.exports = router;
