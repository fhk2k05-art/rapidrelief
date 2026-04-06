// =============================
// 🚀 RAPID RELIEF SERVER (FINAL)
// =============================

const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// =========================
// 🧠 DATABASE (MongoDB)
// =========================
mongoose.connect("mongodb://127.0.0.1:27017/rapidrelief")
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log(err));

// =========================
// 📦 SCHEMAS
// =========================
const User = mongoose.model("User",{
  username:String,
  password:String,
  face:String,
  time:String
});

const SOS = mongoose.model("SOS",{
  lat:Number,
  lon:Number,
  user:String,
  time:String
});

const Track = mongoose.model("Track",{
  lat:Number,
  lon:Number,
  user:String,
  time:String
});

const Category = mongoose.model("Category",{
  type:String,
  user:String,
  time:String
});

// =========================
// ⚙️ MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(session({
  secret:"rapidrelief_secret",
  resave:false,
  saveUninitialized:true
}));

app.use(express.static(__dirname));

// =========================
// 🌐 ROUTES
// =========================
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"login.html"));
});

app.get("/dashboard",(req,res)=>{
  if(!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname,"rr.html"));
});

app.get("/admin",(req,res)=>{
  if(req.session.user === "admin"){
    res.sendFile(path.join(__dirname,"admin.html"));
  } else {
    res.send("❌ Access Denied");
  }
});

// =========================
// 🔐 AUTH
// =========================

// REGISTER
app.post("/register", async (req,res)=>{
  const { username, password } = req.body;

  if(!username || !password){
    return res.json({status:"error"});
  }

  const exists = await User.findOne({ username });
  if(exists) return res.json({status:"exists"});

  const hashed = await bcrypt.hash(password,10);

  await User.create({
    username,
    password: hashed,
    face:null,
    time:new Date().toLocaleString()
  });

  console.log("✅ Registered:", username);
  res.json({status:"registered"});
});

// LOGIN
app.post("/login", async (req,res)=>{
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if(!user) return res.json({status:"fail"});

  const match = await bcrypt.compare(password, user.password);

  if(match){
    req.session.user = username;

    console.log("✅ Login:", username);

    if(username === "admin"){
      return res.json({status:"admin"});
    } else {
      return res.json({status:"user"});
    }
  }

  res.json({status:"fail"});
});

// FACE LOGIN (kept your feature)
app.post("/face-login", async (req,res)=>{
  const { username } = req.body;

  const user = await User.findOne({ username });

  if(user && user.face !== null){
    req.session.user = username;
    return res.json({status:"success"});
  }

  res.json({status:"fail"});
});

// LOGOUT
app.get("/logout",(req,res)=>{
  req.session.destroy(()=>res.redirect("/"));
});

// =========================
// 📊 CATEGORY
// =========================
app.post("/category", async (req,res)=>{
  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  await Category.create(data);

  res.json({ok:true});
});

// =========================
// 🚨 SOS (REAL-TIME)
// =========================
app.post("/sos", async (req,res)=>{
  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  await SOS.create(data);

  console.log("🚨 SOS:", data.user);

  io.emit("newSOS", data); // 🔴 LIVE ALERT

  res.json({ok:true});
});

// =========================
// 📍 TRACK (REAL-TIME)
// =========================
app.post("/track", async (req,res)=>{
  const data = {
    ...req.body,
    user:req.session.user || "guest",
    time:new Date().toLocaleString()
  };

  await Track.create(data);

  io.emit("newTrack", data);

  res.json({ok:true});
});

// =========================
// 📡 ADMIN DATA API
// =========================
app.get("/data", async (req,res)=>{
  const users = await User.find();
  const sos = await SOS.find();
  const track = await Track.find();
  const category = await Category.find();

  res.json({ users, sos, track, category });
});

// =========================
// ⚡ SOCKET CONNECTION
// =========================
io.on("connection", socket=>{
  console.log("⚡ Admin Connected");
});

// =========================
// 🚀 START SERVER
// =========================
server.listen(PORT, ()=>{
  console.log("🚀 Server running on port", PORT);
});
