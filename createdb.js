const mysql = require("mysql2/promise");

async function createDatabaseAndTables(databaseName) {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "azer1234A", // Replace with your password
    });

    // database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    await connection.query(`USE ${databaseName}`);

    //  'users' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);

    // 'reservations' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        number_of_persons INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log(`Database '${databaseName}' and tables created successfully`);
    await connection.end();
  } catch (error) {
    console.error("Error creating database and tables:", error);
  }
}

createDatabaseAndTables("hotelreservations"); //you can change the name if you want but dont forget to change it in app.js also
