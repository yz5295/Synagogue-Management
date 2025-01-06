const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        day_type, 
        DATE_FORMAT(time, '%H:%i') AS time
      FROM prayer_times
      ORDER BY order_index
    `);

    const groupedData = rows.reduce(
      (acc, row) => {
        acc[row.day_type].push({
          id: row.id,
          name: row.name,
          time: row.time,
        });
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

// הוספת תפילה
router.post("/", async (req, res) => {
  const { name, time, dayType } = req.body;
  if (!name || !time || !dayType) {
    return res.status(400).send("Missing data");
  }

  try {
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM prayer_times WHERE day_type = ?",
      [dayType]
    );
    const nextIndex = countRows[0].count;

    const [result] = await pool.query(
      "INSERT INTO prayer_times (name, time, day_type, order_index) VALUES (?, ?, ?, ?)",
      [name, time, dayType, nextIndex]
    );

    res.status(201).json({ id: result.insertId, message: "Prayer time added" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding prayer time");
  }
});

// מחיקת תפילה
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

// עדכון סדר התפילות
router.put("/order", async (req, res) => {
  const { dayType } = req.query;
  const { prayers } = req.body;
  if (!Array.isArray(prayers)) {
    return res.status(400).send("Invalid prayers array");
  }

  try {
    for (let i = 0; i < prayers.length; i++) {
      const { id } = prayers[i];
      await pool.query(
        "UPDATE prayer_times SET order_index = ? WHERE id = ? AND day_type = ?",
        [i, id, dayType]
      );
    }

    res.send("סדר התפילות עודכן בהצלחה");
  } catch (err) {
    console.error(err);
    res.status(500).send("שגיאה בעדכון סדר התפילות");
  }
});

//עריכת תפילה
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, time } = req.body;

  if (!name || !time) {
    return res.status(400).send("Missing data to update");
  }

  try {
    const [result] = await pool.query(
      "UPDATE prayer_times SET name = ?, time = ? WHERE id = ?",
      [name, time, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Prayer not found or nothing updated");
    }

    res.json({ message: "Prayer updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating prayer");
  }
});

module.exports = router;
