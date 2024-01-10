const express = require("express");

const mysql = require("mysql2");

const path = require("path");

const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "azer1234A", //your password
  database: "hotelreservations",
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Database Connected akhay");
  }
});

let loggedInUsername = null;
/*------------------------------------------------------------*/
app.get("/", (req, res) => {
  res.render("index", { username: loggedInUsername });
});
/*------------------------------------------------------------*/
app.get("/about", (req, res) => {
  res.render("about", { username: loggedInUsername });
});
/*----------------------------------------------*/
app.get("/login", (req, res) => {
  res.render("login");
});
/*----------------------------------------------*/
app.get("/logout", (req, res) => {
  loggedInUsername = null;
  res.redirect("/");
});
/*----------------------------------------------*/
app.get("/register", (req, res) => {
  res.render("register");
});
/*----------------------------------------------*/
app.get("/booking", (req, res) => {
  res.render("booking", { username: loggedInUsername });
});
/*----------------------------------------------*/
app.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.render("register", { error: "Please fill in all fields" });
  }

  if (password !== confirmPassword) {
    return res.render("register", { error: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // hash the password

    const insertQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await db.promise().execute(insertQuery, [username, email, hashedPassword]);

    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});
/*----------------------------------------------*/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const selectQuery = "SELECT * FROM users WHERE email = ?";
  db.query(selectQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error logging in:", err);
      res.status(500).send("Error logging in");
    } else {
      if (results.length > 0) {
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          loggedInUsername = user.username;
          res.redirect("/");
        } else {
          res.render("login", { error: "Invalid email or password" });
        }
      } else {
        res.render("login", { error: "Invalid email or password" });
      }
    }
  });
});
/*----------------------------------------------*/
app.post("/make-reservation", async (req, res) => {
  const { checkin, checkout, phoneNumber, hPerson } = req.body;

  try {
    if (!loggedInUsername) {
      return res.status(401).send("User not logged in");
    }

    const getUserIdQuery = "SELECT id FROM users WHERE username = ?";

    const [rows] = await db
      .promise()
      .execute(getUserIdQuery, [loggedInUsername]);

    const userId = rows[0].id;

    const insertReservationQuery =
      "INSERT INTO reservations (user_id, check_in_date, check_out_date, phone_number, number_of_persons) VALUES (?, ?, ?, ?, ?)";

    await db
      .promise()
      .execute(insertReservationQuery, [
        userId,
        checkin,
        checkout,
        phoneNumber,
        hPerson,
      ]);

    res.redirect("/");
  } catch (error) {
    console.error("Error making reservation:", error);
    res.status(500).send("Error making reservation");
  }
});
/*----------------------------------------------*/
app.get("/reservations", async (req, res) => {
  try {
    const getReservationsQuery =
      "SELECT * FROM reservations WHERE user_id = (SELECT id FROM users WHERE username = ?)";

    const [rows] = await db
      .promise()
      .execute(getReservationsQuery, [loggedInUsername]);

    const userReservations = rows;

    res.render("reservations", {
      username: loggedInUsername,
      reservations: userReservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Error fetching reservations");
  }
});
/*----------------------------------------------*/
app.post("/remove-reservation", async (req, res) => {
  const { reservation_id } = req.body;

  try {
    const deleteQuery = "DELETE FROM reservations WHERE id = ?";
    await db.promise().execute(deleteQuery, [reservation_id]);
    res.redirect("/reservations");
  } catch (error) {
    console.error("Error removing reservation:", error);
    res.status(500).send("Error removing reservation");
  }
});
/*----------------------------------------------*/
app.listen(5002, () => {
  console.log("Server is running on port 5002");
});
