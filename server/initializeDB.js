const pool = require("./config/db"); // ייבוא החיבור ל-MySQL

const initializeDatabase = async () => {
  try {
    const queries = [
      "USE railway",
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(40) NOT NULL,
        last_name VARCHAR(40) NOT NULL,
        address VARCHAR(40),
        city VARCHAR(40),
        phone VARCHAR(20),
        email VARCHAR(80) UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      )`,
      `CREATE TABLE IF NOT EXISTS congratulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS messageAdmin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS prayer_times (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        time TIME NOT NULL,
        day_type ENUM('weekday', 'shabbat') NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        synagogue_name VARCHAR(255) NOT NULL,
        manager_name VARCHAR(255) NOT NULL,
        administrator_password VARCHAR(255) NOT NULL,
        hall_price_per_hour DECIMAL(10, 2) NOT NULL,
        price_per_person DECIMAL(10, 2) NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        purpose VARCHAR(255),
        user_id INT NOT NULL,
        date DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE,
        eventType VARCHAR(50),
        startTime TIME,
        endTime TIME,
        catering BOOLEAN,
        mealCount INT,
        amount DECIMAL(10,2),
        hours INT,
        user_id INT,
        orderDate DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255),
        text TEXT,
        timestamp DATETIME,
        read_boolean BOOLEAN DEFAULT FALSE,
        user_id INT,
        archived BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS finance_manager (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('expense', 'income') NOT NULL,
        category VARCHAR(255) NOT NULL,
        details VARCHAR(255),
        date DATETIME NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        readOnly BOOLEAN DEFAULT FALSE,
        original_id INT,
        UNIQUE KEY original_id (original_id)
      )`,
    ];

    for (const query of queries) {
      await pool.query(query);
      console.log(`Executed: ${query}`);
    }

    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
  } finally {
    pool.end();
  }
};

module.exports = initializeDatabase;
