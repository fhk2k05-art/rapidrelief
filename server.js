const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* ===== DATA ===== */
let users = [];
let sosData = [];
let trackingData = [];
let categoryLogs = [];

/* ===== ROUTES ===== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "rr.html"));
});

/* ===== REGISTER ===== */
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  users.push({
    username,
    password,
    time: new Date().toLocaleString()
  });

  res.json({ ok: true });
});

/* ===== LOGIN ===== */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  res.json({ success: !!user });
});

/* ===== CATEGORY ===== */
app.post("/category", (req, res) => {
  categoryLogs.push({
    ...req.body,
    time: new Date().toLocaleString()
  });

  res.json({ ok: true });
});

/* ===== SOS ===== */
app.post("/sos", (req, res) => {

  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  sosData.push(data);

  console.log("🚨 SOS:", data);

  res.json({ ok: true });
});

/* ===== TRACK ===== */
app.post("/track", (req, res) => {

  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  trackingData.push(data);

  console.log("📍 TRACK:", data);

  res.json({ ok: true });
});

/* ===== ADMIN ===== */

app.get("/admin/sos", (req, res) => res.json(sosData));
app.get("/admin/track", (req, res) => res.json(trackingData));
app.get("/admin/users", (req, res) => res.json(users));
app.get("/admin/category", (req, res) => res.json(categoryLogs));

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
