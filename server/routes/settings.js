const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

router.post("/", async (req, res) => {
  const {
    synagogueName,
    managerName,
    administratorPassword,
    hallPricePerHour,
    pricePerPerson,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(administratorPassword, 10);
    const [existingRows] = await pool.query("SELECT id FROM settings LIMIT 1");
    if (existingRows.length > 0) {
      const query = `
                UPDATE settings
                SET 
                    synagogue_name = ?,
                    manager_name = ?,
                    administrator_password = ?,
                    hall_price_per_hour = ?,
                    price_per_person = ?
                WHERE id = ?
            `;
      await pool.query(query, [
        synagogueName,
        managerName,
        hashedPassword,
        hallPricePerHour,
        pricePerPerson,
        existingRows[0].id,
      ]);
      res.status(200).json({ message: "Settings updated successfully" });
    } else {
      const query = `
                INSERT INTO settings (synagogue_name, manager_name, administrator_password, hall_price_per_hour, price_per_person)
                VALUES (?, ?, ?, ?, ?)
            `;
      await pool.query(query, [
        synagogueName,
        managerName,
        hashedPassword,
        hallPricePerHour,
        pricePerPerson,
      ]);
      res.status(200).json({ message: "Settings saved successfully" });
    }
  } catch (error) {
    console.error("Error saving/updating settings:", error);
    res.status(500).json({ message: "Error saving/updating settings" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM settings ORDER BY id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ settingsExist: false, message: "No settings found" });
    }

    const {
      id,
      synagogue_name,
      manager_name,
      hall_price_per_hour,
      price_per_person,
    } = rows[0];
    res.json({
      settingsExist: true,
      id,
      synagogueName: synagogue_name,
      managerName: manager_name,
      hallPricePerHour: hall_price_per_hour,
      pricePerPerson: price_per_person,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error loading settings" });
  }
});

router.post("/login", async (req, res) => {
  const { password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT administrator_password, synagogue_name FROM settings LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No administrator found" });
    }

    const { administrator_password, synagogue_name } = rows[0];

    const isMatch = await bcrypt.compare(password, administrator_password);

    if (isMatch) {
      res
        .status(200)
        .json({ message: "Login successful", synagogueName: synagogue_name });
    } else {
      res.status(401).json({ message: "סיסמה שגויה" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

module.exports = router;
