const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

/* ✅ VERY IMPORTANT (FIXES YOUR ERROR) */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* SESSION */
app.use(session({
  secret: "rapidrelief",
  resave: false,
  saveUninitialized: true
}));

/* STATIC FILES */
app.use(express.static(path.join(__dirname)));

/* IN-MEMORY USERS (for now) */
let users = [];

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

/* REGISTER */
app.post("/register", (req, res) => {

  const { email, password } = req.body;

  console.log("REGISTER:", req.body);

  if (!email || !password) {
    return res.json({ status: "error", message: "Missing fields" });
  }

  const exists = users.find(u => u.email === email);

  if (exists) {
    return res.json({ status: "error", message: "User already exists" });
  }

  users.push({ email, password });

  res.json({ status: "success", message: "Registered successfully" });
});

/* LOGIN */
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  console.log("LOGIN:", req.body);

  if (!email || !password) {
    return res.json({ status: "error", message: "Missing fields" });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = user;
    return res.json({ status: "success" });
  } else {
    return res.json({ status: "error", message: "Invalid credentials" });
  }
});

/* DASHBOARD */
app.get("/rr.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "rr.html"));
});

/* LOGOUT */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* START SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
