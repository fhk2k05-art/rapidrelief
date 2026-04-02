const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "secure_admin_key",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

/* =========================
   LOAD / SAVE DATA
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
  if(!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "rr.html"));
});

app.get("/admin", (req, res) => {
  if(req.session.user === "admin"){
    res.sendFile(path.join(__dirname, "admin.html"));
  } else {
    res.send("❌ Access Denied");
  }
});

/* =========================
   AUTH
========================= */

/* REGISTER */
app.post("/register", (req, res) => {

  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) return res.json({ status: "exists" });

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

/* LOGIN */
app.post("/login", (req, res) => {

  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    req.session.user = username;

    if(username === "admin"){
      return res.json({ status: "admin" });
    } else {
      return res.json({ status: "user" });
    }

  } else {
    res.json({ status: "fail" });
  }
});

/* LOGOUT */
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* =========================
   CATEGORY
========================= */
app.post("/category", (req, res) => {

  const data = {
    ...req.body,
    user: req.session.user || "guest",
    time: new Date().toLocaleString()
  };

  categoryLogs.push(data);
  saveData("category.json", categoryLogs);

  res.json({ ok: true });
});

/* =========================
   SOS
========================= */
app.post("/sos", (req, res) => {

  const data = {
    ...req.body,
    user: req.session.user || "guest",
    time: new Date().toLocaleString()
  };

  sosData.push(data);
  saveData("sos.json", sosData);

  console.log("🚨 SOS:", data);

  res.json({ ok: true });
});

/* =========================
   TRACK
========================= */
app.post("/track", (req, res) => {

  const data = {
    ...req.body,
    user: req.session.user || "guest",
    time: new Date().toLocaleString()
  };

  trackingData.push(data);
  saveData("track.json", trackingData);

  res.json({ ok: true });
});

/* =========================
   ADMIN PROTECTION
========================= */

function isAdmin(req, res, next){
  if(req.session.user === "admin"){
    next();
  } else {
    res.status(403).send("❌ Unauthorized");
  }
}

/* ADMIN APIs */
app.get("/admin/sos", isAdmin, (req,res)=>res.json(sosData));
app.get("/admin/track", isAdmin, (req,res)=>res.json(trackingData));
app.get("/admin/users", isAdmin, (req,res)=>res.json(users));
app.get("/admin/category", isAdmin, (req,res)=>res.json(categoryLogs));

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
