const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "rapidrelief_secret",
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

/* DATA */
let users = [];
let sosData = [];
let trackingData = [];
let categoryLogs = [];

/* AUTH */
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  users.push({
    username,
    password,
    time: new Date().toLocaleString()
  });

  res.json({ status: "registered" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = username;
    res.json({ status: "success" });
  } else {
    res.json({ status: "fail" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ROUTES */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "rr.html"));
});

/* CATEGORY */
app.post("/category", (req, res) => {
  categoryLogs.push({ ...req.body, time: new Date().toLocaleString() });
  res.json({ ok: true });
});

/* SOS */
app.post("/sos", (req, res) => {
  const data = {
    ...req.body,
    time: new Date().toLocaleString()
  };

  sosData.push(data);

  console.log("🚨 SOS:", data);

  res.json({ status: "saved" });
});

/* TRACK */
app.post("/track", (req, res) => {
  trackingData.push(req.body);
  res.json({ ok: true });
});

/* ADMIN APIs */
app.get("/admin/sos", (req, res) => res.json(sosData));
app.get("/admin/track", (req, res) => res.json(trackingData));
app.get("/admin/category", (req, res) => res.json(categoryLogs));
app.get("/admin/users", (req, res) => res.json(users));

/* START */
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
