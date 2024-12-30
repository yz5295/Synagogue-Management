const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// קריאת כל הנתונים
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM finance_manager");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data.");
  }
});

// הוספת נתון חדש
router.post("/", async (req, res) => {
  const { type, category, details, date, amount, readOnly } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO finance_manager ( type, category, details, date, amount, readOnly) VALUES (?, ?, ?, ?, ?, ?)",
      [type, category, details, new Date(date), amount, readOnly || false]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data.");
  }
});

// עדכון נתון קיים
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { type, category, details, date, amount, readOnly } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE finance_manager SET type = ?, category = ?, details = ?, date = ?, amount = ?, readOnly = ? WHERE id = ?",
      [type, category, details, new Date(date), amount, readOnly, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Item not found" });
    }

    res.status(200).send("Data updated successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating data.");
  }
});

// מחיקת נתון
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM finance_manager WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Item not found" });
    }

    res.status(200).send("Data deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting data.");
  }
});

// נתיב לעדכון Finance על ידי ייבוא Donations ו-Events
router.post("/update-finance", async (req, res) => {
  try {
    const [donations] = await pool.query("SELECT * FROM donations");
    const [events] = await pool.query("SELECT * FROM events");
    const financeData = [];

    donations.forEach((donation) => {
      financeData.push({
        type: "income",
        category: "תרומה",
        details: donation.purpose,
        date: donation.date,
        amount: donation.amount,
        readOnly: true,
        original_id: donation.id,
      });
    });

    events.forEach((event) => {
      financeData.push({
        type: "income",
        category: "הזמנת אולם",
        details: event.eventType,
        date: event.orderDate,
        amount: event.amount,
        readOnly: true,
        original_id: event.id,
      });
    });

    const insertPromises = financeData.map((entry) => {
      return pool.query(
        `INSERT INTO finance_manager (type, category, details, date, amount, readOnly, original_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           type = VALUES(type),
           category = VALUES(category),
           details = VALUES(details),
           date = VALUES(date),
           amount = VALUES(amount),
           readOnly = VALUES(readOnly)`,
        [
          entry.type,
          entry.category,
          entry.details,
          entry.date,
          entry.amount,
          entry.readOnly,
          entry.original_id,
        ]
      );
    });

    await Promise.all(insertPromises);

    res
      .status(200)
      .send({ message: "Finance manager data updated successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "An error occurred while updating finance manager data.",
    });
  }
});

router.get("/get-transaction", async (req, res) => {
  const { type, original_id } = req.query;

  if (!type || !original_id) {
    return res
      .status(400)
      .send({ message: "type and original_id are required." });
  }

  if (!["donation", "event"].includes(type)) {
    return res
      .status(400)
      .send({ message: "Invalid type. Must be 'donation' or 'event'." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM finance_manager WHERE type = ? AND original_id = ?",
      ["income", original_id]
    );

    if (rows.length === 0) {
      return res.status(404).send({ message: "Transaction not found." });
    }

    const transaction = rows[0];

    if (type === "donation") {
      const [donations] = await db.query(
        "SELECT * FROM donations WHERE id = ?",
        [original_id]
      );
      if (donations.length > 0) {
        transaction.donationDetails = donations[0];
      }
    }

    if (type === "event") {
      const [events] = await db.query("SELECT * FROM events WHERE id = ?", [
        original_id,
      ]);
      if (events.length > 0) {
        transaction.eventDetails = events[0];
      }
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

module.exports = router;
