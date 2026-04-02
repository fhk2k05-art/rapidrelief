const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* =========================
   📁 LOAD DATA
========================= */

function loadData(file){
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
}

function saveData(file,data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let users = loadData("users.json");
let sosData = loadData("sos.json");
let trackingData = loadData("track.json");
let categoryLogs = loadData("category.json");

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "rr.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* =========================
   🔐 REGISTER
========================= */
app.post("/register", (req, res) => {

  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);

  if (exists) {
    return res.json({ status: "exists" });
  }

  const user = {
    username,
    password,
    time: new Date().toLocaleString()
  };

  users.push(user);
  saveData("users.json", users);

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
  saveData("category.json", categoryLogs);

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
  saveData("sos.json", sosData);

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
  saveData("track.json", trackingData);

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
   🚀 START
========================= */

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
