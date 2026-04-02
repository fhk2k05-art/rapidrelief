const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* =========================
   📁 LOAD USERS FROM FILE
========================= */
let users = [];
let sosData = [];
let trackingData = [];
let categoryLogs = [];

if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json"));
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "rr.html"));
});

/* =========================
   🔐 REGISTER
========================= */
app.post("/register", (req, res) => {

  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);

  if (exists) {
    return res.json({ status: "user_exists" });
  }

  const user = {
    username,
    password,
    time: new Date().toLocaleString()
  };

  users.push(user);

  // SAVE TO FILE
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  console.log("👤 Registered:", user);

  res.json({ status: "registered" });
});

/* =========================
   🔑 LOGIN
========================= */
app.post("/login", (req, res) => {

  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "fail" });
  }
});

/* =========================
   🚪 LOGOUT
========================= */
app.get("/logout", (req, res) => {
  res.redirect("/");
});

/* =========================
   📌 CATEGORY
========================= */
app.post("/category", (req, res) => {

  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  categoryLogs.push(data);

  console.log("📌 Category:", data);

  res.json({ ok: true });
});

/* =========================
   🚨 SOS
========================= */
app.post("/sos", (req, res) => {

  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  sosData.push(data);

  console.log("🚨 SOS:", data);

  res.json({ ok: true });
});

/* =========================
   📍 TRACKING
========================= */
app.post("/track", (req, res) => {

  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  trackingData.push(data);

  console.log("📍 Track:", data);

  res.json({ ok: true });
});

/* =========================
   🧑‍💼 ADMIN APIs
========================= */

app.get("/admin/sos", (req, res) => {
  res.json(sosData);
});

app.get("/admin/track", (req, res) => {
  res.json(trackingData);
});

app.get("/admin/users", (req, res) => {
  res.json(users);
});

app.get("/admin/category", (req, res) => {
  res.json(categoryLogs);
});

/* =========================
   🚀 START SERVER
========================= */

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
