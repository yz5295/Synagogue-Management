const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, day_type, DATE_FORMAT(time, '%H:%i') AS time FROM prayer_times"
    );
    const groupedData = rows.reduce(
      (acc, row) => {
        acc[row.day_type].push({ id: row.id, name: row.name, time: row.time });
        return acc;
      },
      { weekday: [], shabbat: [] }
    );
    res.json(groupedData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving prayer times");
  }
});

router.post("/", async (req, res) => {
  const { name, time, dayType } = req.body;
  if (!name || !time || !dayType) {
    return res.status(400).send("Missing data");
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO prayer_times (name, time, day_type) VALUES (?, ?, ?)",
      [name, time, dayType]
    );
    res.status(201).json({ id: result.insertId, message: "Prayer time added" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding prayer time");
  }
});

router.delete("/:name", async (req, res) => {
  const { name } = req.params;
  const { dayType } = req.query;

  if (!name || !dayType) {
    return res.status(400).send("חסר נתון: שם התפילה או סוג היום");
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM prayer_times WHERE name = ? AND day_type = ?",
      [name, dayType]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("התפילה לא נמצאה");
    }

    res.send("התפילה הוסרה בהצלחה");
  } catch (err) {
    console.error(err);
    res.status(500).send("שגיאה במחיקת התפילה");
  }
});

module.exports = router;
