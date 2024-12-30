const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// קריאת כל האירועים
router.get("/events", async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.first_name, u.last_name, u.phone, u.email 
      FROM events e 
      JOIN users u ON e.user_id = u.id
    `);
    const formattedEvents = events.map((event) => ({
      ...event,
      startTime: event.startTime.slice(0, 5),
      endTime: event.endTime.slice(0, 5),
    }));

    res.json(formattedEvents);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// הוספת הזמנה חדשה
router.post("/bookings", async (req, res) => {
  const {
    date,
    eventType,
    startTime,
    endTime,
    catering,
    mealCount,
    amount,
    hours,
    user,
    orderDate,
  } = req.body;

  try {
    // בדיקה אם המשתמש קיים
    const [existingUser] = await pool.query(
      `SELECT id FROM users WHERE id = ?`,
      [user.id]
    );

    if (existingUser.length === 0) {
      // הוספת משתמש חדש
      await pool.query(
        `INSERT INTO users (id, first_name, last_name, address, city, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.first_name,
          user.last_name,
          user.address,
          user.city,
          user.phone,
          user.email,
        ]
      );
    }

    // הוספת הזמנה חדשה
    const [result] = await pool.query(
      `INSERT INTO events (date, eventType, startTime, endTime, catering, mealCount, amount, hours, user_id, orderDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        eventType,
        startTime,
        endTime,
        catering,
        mealCount,
        amount,
        hours,
        user.id,
        orderDate,
      ]
    );

    res.json({
      success: true,
      message: "הזמנה נשמרה בהצלחה",
      eventId: result.insertId,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// קבלת תאריכים תפוסים
router.get("/booked-times", async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') AS date,
    TIME_FORMAT(startTime, '%H:%i:%s') AS start,
    TIME_FORMAT(endTime, '%H:%i:%s') AS end
    FROM events`
    );
    res.json(events);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
